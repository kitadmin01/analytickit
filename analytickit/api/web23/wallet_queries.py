from typing import List, Dict, Any, Optional, Union, Tuple
from datetime import datetime, timedelta
from collections import defaultdict
from django.db.models.functions import Lower
from analytickit.models.crypto.wallet_address import VisitorWalletAddress
from analytickit.client import sync_execute
import json
import logging
from statistics import median, stdev

logger = logging.getLogger(__name__)

def get_team_wallet_addresses(team_id: int, from_timestamp: datetime, wallet_address: str = None) -> List[Dict[str, Any]]:
    """
    Retrieve visitor wallet data for a given team_id, timestamp and optional wallet address
    
    Args:
        team_id: The ID of the team to query for
        from_timestamp: Datetime to filter addresses created after this timestamp
        wallet_address: Optional wallet address to filter results (case-insensitive)
        
    Returns:
        List of dictionaries containing all wallet data
    """
    query = VisitorWalletAddress.objects.filter(
        team_id=team_id,
        visitor_wallet_address_ts__gte=from_timestamp
    )
    
    if wallet_address:
        # Convert the input wallet address to lowercase for comparison
        wallet_address = wallet_address.lower()
        # Use Lower function for case-insensitive comparison
        query = query.annotate(
            wallet_lower=Lower('visitor_wallet_address')
        ).filter(wallet_lower=wallet_address)

    # Convert queryset to list of dictionaries
    wallet_data = list(query.values(
        'visitor_wallet_address',
        'visitor_wallet_address_ts',
        'creation_ts',
        'update_ts',
        'community_engagement_id',
        'team_id',
        'txn_data',
        'token_transfer_data'
    ).order_by('visitor_wallet_address_ts'))  # Added ordering
    
    return wallet_data

def get_wallet_login_events(
    team_id: int, 
    event_name: str = 'WalletLogin',
    wallet_address: str = None, 
    days: int = 1,
    from_date: datetime = None
) -> List[Dict[str, Any]]:
    """
    Retrieve wallet events from Clickhouse for a given team_id, event name, wallet address and time period
    
    Args:
        team_id: The ID of the team to query for
        event_name: Name of the event to filter by (default: 'WalletLogin')
        wallet_address: Wallet address to filter by (case-insensitive)
        days: Number of days to look back (default: 1)
        from_date: Starting date for the query (default: None, will use today)
        
    Returns:
        List of dictionaries containing properties, person_properties and person_id
    """
    # Build the date clause - Always use toDateTime for consistency
    if from_date:
        to_date = from_date + timedelta(days=days)
        date_clause = "timestamp >= toDateTime(%(from_date)s) AND timestamp < toDateTime(%(to_date)s)"
    else:
        from_date = datetime.now() - timedelta(days=days)
        to_date = datetime.now()
        date_clause = "timestamp >= toDateTime(%(from_date)s) AND timestamp < toDateTime(%(to_date)s)"
    
    base_query = f"""
        SELECT 
            event,
            properties,
            person_properties,
            person_id,
            timestamp
        FROM default.events 
        WHERE event = %(event_name)s
        AND {date_clause}
        AND team_id = %(team_id)s
    """
    
    params = {
        "team_id": team_id,
        "days": days,
        "event_name": event_name,
        "from_date": from_date,
        "to_date": to_date
    }
    
    if wallet_address:
        wallet_query = """
            AND lower(JSONExtractString(properties, '$crypto_wallet_public_address')) = lower(%(wallet_address)s)
        """
        base_query += wallet_query
        params["wallet_address"] = wallet_address

    results = sync_execute(base_query, params)
    
    events_data = [
        {
            "event": result[0],
            "properties": result[1],
            "person_properties": result[2],
            "person_id": result[3],
            "timestamp": result[4]
        }
        for result in results
    ]
    
    return events_data

def get_consolidated_wallet_data(
    team_id: int, 
    wallet_address: str = None, 
    from_timestamp: datetime = None,
    days: int = 1
) -> Dict[str, Any]:
    """
    Retrieve consolidated wallet data combining both wallet addresses and login events
    
    Args:
        team_id: The ID of the team to query for
        wallet_address: Optional wallet address to filter results (case-insensitive)
        from_timestamp: Datetime to filter addresses created after this timestamp
        days: Number of days to look back for login events (default: 1)
        
    Returns:
        Dictionary containing combined wallet data and login events
    """
    # If from_timestamp is not provided, calculate it based on days
    if not from_timestamp:
        from_timestamp = datetime.now() - timedelta(days=days)

    # Get wallet address data
    wallet_addresses = get_team_wallet_addresses(
        team_id=team_id,
        from_timestamp=from_timestamp,
        wallet_address=wallet_address
    )

    # Get login events - Updated to use from_date parameter
    login_events = get_wallet_login_events(
        team_id=team_id,
        event_name='WalletLogin',
        wallet_address=wallet_address,
        days=days,
        from_date=from_timestamp  # Use from_timestamp as from_date
    )

    # Combine the results
    consolidated_data = {
        "wallet_data": {
            "addresses": wallet_addresses,
            "total_addresses": len(wallet_addresses)
        },
        "login_events": {
            "events": login_events,
            "total_events": len(login_events)
        },
        "metadata": {
            "team_id": team_id,
            "wallet_address": wallet_address,
            "from_timestamp": from_timestamp.isoformat() if from_timestamp else None,
            "days_lookback": days
        }
    }

    return consolidated_data

def get_person_events(
    team_id: int,
    person_id: str,
    days: int = 1,
    from_date: datetime = None
) -> List[Dict[str, Any]]:
    """
    Retrieve all events (except WalletLogin) from Clickhouse for a given team_id and person_id within time period
    
    Args:
        team_id: The ID of the team to query for
        person_id: Person ID to filter by
        days: Number of days to look back (default: 1)
        from_date: Starting date for the query (default: None, will use today)
        
    Returns:
        List of dictionaries containing event, properties and person_properties
    """
    # Build the date clause
    if from_date:
        to_date = from_date + timedelta(days=days)
        date_clause = "timestamp >= toDateTime(%(from_date)s) AND timestamp < toDateTime(%(to_date)s)"
    else:
        date_clause = "timestamp >= today() - INTERVAL %(days)s DAY"
    
    base_query = f"""
        SELECT 
            event,
            properties,
            person_properties,
            timestamp
        FROM default.events 
        WHERE {date_clause}
        AND team_id = %(team_id)s
        AND person_id = %(person_id)s
        AND event != 'WalletLogin'  -- Exclude WalletLogin events
        ORDER BY timestamp DESC
    """
    
    params = {
        "team_id": team_id,
        "days": days,
        "person_id": person_id
    }
    
    # Add date parameters if from_date is provided
    if from_date:
        params["from_date"] = from_date
        params["to_date"] = to_date
    
    results = sync_execute(base_query, params)
    
    # Convert results to list of dictionaries
    events_data = [
        {
            "event": result[0],
            "properties": result[1],
            "person_properties": result[2],
            "timestamp": result[3]
        }
        for result in results
    ]
    
    return events_data

class UserFunnelAnalysis:
    """
    Class to analyze user funnel from web2 and web3 data
    
    Funnel stages:
    1. Awareness (Initial Visit)
    2. Engagement (Campaign Interaction)
    3. Conversion (Web3 Transaction)
    """
    
    def __init__(self, team_id: int, from_date: str, days: int):
        """
        Initialize the funnel analysis with team ID, start date, and number of days.
        
        Args:
            team_id: The team ID to analyze
            from_date: Start date in YYYY-MM-DD format or a datetime object
            days: Number of days to analyze from the start date
        """
        self.team_id = team_id
        
        # Handle from_date as either string or datetime
        if isinstance(from_date, str):
            self.from_date = from_date
            try:
                # Validate the date format
                datetime.strptime(from_date, "%Y-%m-%d")
            except ValueError as e:
                print(f"Warning: Invalid date format for from_date '{from_date}': {str(e)}")
                # Use current date as fallback
                self.from_date = datetime.now().strftime("%Y-%m-%d")
                print(f"Using current date instead: {self.from_date}")
        else:
            # Convert datetime object to string
            self.from_date = from_date.strftime("%Y-%m-%d")
            
        self.days = days
        
        # Calculate to_date for display purposes
        from_date_obj = datetime.strptime(self.from_date, "%Y-%m-%d")
        to_date_obj = from_date_obj + timedelta(days=days)
        self.to_date = to_date_obj.strftime("%Y-%m-%d")
        
        print(f"Initialized UserFunnelAnalysis for team {team_id} from {self.from_date} to {self.to_date}")
        
    def get_funnel_data(self) -> Dict[str, Any]:
        """
        Main method to retrieve and process funnel data
        """
        try:
            # Fetch raw event data
            events = self._fetch_events()
            
            if not events:
                return {"error": "No funnel data available for this team."}
            
            # Process events into funnel stages
            visits, engagement_events, conversion_events = self._process_events(events)
            
            # Calculate summary metrics
            summary = self._calculate_summary(visits, engagement_events, conversion_events)
            
            # Calculate daily metrics
            daily_metrics = self._calculate_daily_metrics(visits, engagement_events, conversion_events)
            
            # Calculate weekly metrics with WoW comparison
            weekly_metrics = self._calculate_weekly_metrics(daily_metrics)
            
            # Analyze campaign performance
            campaign_performance = self._analyze_campaign_performance(visits)
            
            # Analyze device and browser usage
            device_analytics = self._analyze_device_analytics(visits)
            
            # Analyze conversion metrics
            conversion_metrics = self._analyze_conversion_metrics(conversion_events, visits)
            
            # Calculate time-to-conversion metrics
            time_to_conversion = self._calculate_time_to_conversion(visits, conversion_events)
            
            return {
                "metadata": {
                    "team_id": self.team_id,
                    "from_date": self.from_date,
                    "to_date": self.to_date,
                    "days": self.days,
                    "weeks": len(weekly_metrics)
                },
                "summary": summary,
                "daily_metrics": daily_metrics,
                "weekly_metrics": weekly_metrics,
                "campaign_performance": campaign_performance,
                "device_analytics": device_analytics,
                "conversion_metrics": conversion_metrics,
                "time_to_conversion": time_to_conversion
            }
        except Exception as e:
            logger.error(f"Error in get_funnel_data: {str(e)}")
            return {"error": f"Failed to analyze funnel data: {str(e)}"}
    
    def _fetch_events(self) -> List[Dict[str, Any]]:
        """
        Fetch events from ClickHouse for the specified team and date range.
        """
        from analytickit.client import sync_execute
        from datetime import datetime, timedelta
        
        logger = logging.getLogger(__name__)
        
        # Parse from_date string to datetime
        try:
            if isinstance(self.from_date, str):
                from_date = datetime.strptime(self.from_date, "%Y-%m-%d")
                logger.info(f"Parsed from_date string '{self.from_date}' to {from_date}")
            else:
                from_date = self.from_date
                logger.info(f"Using from_date object directly: {from_date}")
        except ValueError as e:
            logger.error(f"Error parsing from_date '{self.from_date}': {str(e)}")
            # Default to current date if parsing fails
            from_date = datetime.now()
            logger.info(f"Using default date: {from_date}")
            
        # Calculate to_date
        to_date = from_date + timedelta(days=self.days)
        
        # Debug information
        logger.info(f"Fetching events for team {self.team_id} from {from_date} to {to_date}")
        print(f"Fetching events for team {self.team_id} from {from_date} to {to_date}")
        
        # Query to get all events for the team in the date range
        query = """
        SELECT
            event,
            properties,
            person_properties,
            distinct_id,
            timestamp
        FROM events
        WHERE team_id = %(team_id)s
          AND timestamp >= %(from_date)s
          AND timestamp <= %(to_date)s
        ORDER BY timestamp
        """
        
        params = {
            "team_id": self.team_id,
            "from_date": from_date,
            "to_date": to_date
        }
        
        logger.info(f"Query params: {params}")
        
        try:
            results = sync_execute(query, params)
            
            # Debug information
            event_count = len(results)
            logger.info(f"Found {event_count} events")
            print(f"Found {event_count} events")
            
            if event_count > 0:
                # Log the first few events for debugging
                for i, row in enumerate(results[:3]):
                    event_name = row[0]
                    logger.info(f"Event {i+1}: {event_name} at {row[4]}")
                    print(f"Event {i+1}: {event_name} at {row[4]}")
            else:
                logger.warning("No events found for the specified criteria")
                print("No events found for the specified criteria")
            
            # Convert to list of dictionaries
            events = []
            for row in results:
                event_name, properties_json, person_properties_json, distinct_id, timestamp = row
                
                # Parse JSON properties
                properties = self._parse_json_safely(properties_json)
                person_properties = self._parse_json_safely(person_properties_json)
                
                events.append({
                    "event": event_name,
                    "properties": properties,
                    "person_properties": person_properties,
                    "distinct_id": distinct_id,
                    "timestamp": timestamp.isoformat() if timestamp else None
                })
            
            return events
            
        except Exception as e:
            logger.error(f"Error fetching events: {str(e)}")
            print(f"Error fetching events: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            print(traceback.format_exc())
            return []
    
    def _process_events(self, events: List[Dict[str, Any]]) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]], List[Dict[str, Any]]]:
        """
        Process events into three categories: visits, engagement, and conversion.
        """
        visits = []
        engagement_events = []
        conversion_events = []
        
        for event in events:
            event_name = event.get('event', '')
            properties = event.get('properties', {})
            
            # Process pageview events as visits
            if event_name.lower() in ['$pageview', 'pageview']:
                visits.append(event)
                continue
                
            # Check for engagement events
            if self._is_engagement_event(event_name, properties):
                engagement_events.append(event)
                continue
                
            # Check for conversion events
            if self._is_conversion_event(event_name, properties):
                # Process transaction data if available
                if 'txn_data' in properties:
                    txn_data = self._parse_json_safely(properties['txn_data'])
                    token_transfer_data = self._parse_json_safely(properties.get('token_transfer_data', '{}'))
                    event['merged_txn_data'] = self._merge_transaction_data(txn_data, token_transfer_data)
                
                conversion_events.append(event)
                continue
                
            # If not categorized yet, check if it's a visit
            if not visits and ('$current_url' in properties or 'url' in properties):
                visits.append(event)
        
        return visits, engagement_events, conversion_events
    
    def _extract_wallet_address(self, properties: Dict[str, Any]) -> Optional[str]:
        """
        Extract wallet address from event properties
        Check multiple possible property names
        """
        for key in ["wallet_address", "walletAddress", "$wallet_address", "wallet"]:
            if key in properties and properties[key]:
                return properties[key].lower()  # Normalize to lowercase
        return None
    
    def _is_engagement_event(self, event_name: str, properties: Dict[str, Any]) -> bool:
        """Determine if an event is an engagement event."""
        # Consider WalletLogin as an engagement event
        if event_name.lower() == 'walletlogin':
            return True
        
        # Check for wallet-related properties in any event
        wallet_address = self._extract_wallet_address(properties)
        if wallet_address:
            return True
            
        # Add other engagement event criteria here
        engagement_events = ['login', 'signup', 'connect_wallet', 'wallet_connected']
        return event_name.lower() in [e.lower() for e in engagement_events]
    
    def _is_conversion_event(self, event_name: str, properties: Dict[str, Any]) -> bool:
        """Determine if an event is a conversion event."""
        # Transaction events are conversion events
        if 'transaction' in event_name.lower():
            return True
            
        # Check for transaction data in properties
        if 'txn_data' in properties or 'transaction' in properties:
            return True
            
        # Add other conversion event criteria here
        conversion_events = ['purchase', 'swap', 'transfer', 'mint', 'stake']
        return event_name.lower() in [e.lower() for e in conversion_events]
    
    def _parse_json_safely(self, data: Any) -> Any:
        """
        Safely parse JSON data if it's a string
        """
        if isinstance(data, str):
            try:
                return json.loads(data)
            except json.JSONDecodeError:
                logger.warning(f"Failed to parse JSON: {data[:100]}...")
                return data
        return data
    
    def _merge_transaction_data(self, txn_data: Any, token_transfer_data: Any) -> Dict[str, Any]:
        """
        Merge transaction data with token transfer data
        """
        result = {}
        
        # Add transaction data
        if isinstance(txn_data, dict):
            result.update(txn_data)
        elif isinstance(txn_data, list) and txn_data:
            result.update(txn_data[0] if isinstance(txn_data[0], dict) else {})
        
        # Add token transfer data
        if isinstance(token_transfer_data, dict):
            result["token_transfers"] = [token_transfer_data]
        elif isinstance(token_transfer_data, list):
            result["token_transfers"] = token_transfer_data
        
        return result
    
    def _calculate_time_difference(self, start_time: str, end_time: str) -> Optional[int]:
        """
        Calculate time difference in minutes between two timestamps
        """
        try:
            start = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
            end = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
            return int((end - start).total_seconds() / 60)
        except (ValueError, TypeError):
            return None
    
    def _calculate_summary(self, visits: List[Dict[str, Any]], engagement_events: List[Dict[str, Any]], 
                          conversion_events: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Calculate summary metrics for the funnel
        """
        total_visits = len(visits)
        total_engagement = len(engagement_events)
        total_conversions = len(conversion_events)
        
        # Extract unique wallets
        unique_wallets = set()
        for event in visits + engagement_events + conversion_events:
            wallet = self._extract_wallet_address(event.get("properties", {}))
            if wallet:
                unique_wallets.add(wallet)
        
        # Calculate conversion rates
        overall_conversion_rate = total_conversions / total_visits if total_visits > 0 else 0
        awareness_to_engagement_rate = total_engagement / total_visits if total_visits > 0 else 0
        engagement_to_conversion_rate = total_conversions / total_engagement if total_engagement > 0 else 0
        
        # Calculate transaction values
        transaction_values = []
        for event in conversion_events:
            value = self._extract_transaction_value(event)
            if value is not None:
                transaction_values.append(value)
        
        avg_transaction_value = sum(transaction_values) / len(transaction_values) if transaction_values else 0
        median_transaction_value = median(transaction_values) if len(transaction_values) >= 1 else 0
        total_transaction_value = sum(transaction_values)
        
        # Calculate standard deviation if we have enough data
        std_dev_transaction_value = stdev(transaction_values) if len(transaction_values) >= 2 else 0
        
        return {
            "total_visits": total_visits,
            "total_engagement": total_engagement,
            "total_conversions": total_conversions,
            "unique_wallets": len(unique_wallets),
            "overall_conversion_rate": overall_conversion_rate,
            "awareness_to_engagement_rate": awareness_to_engagement_rate,
            "engagement_to_conversion_rate": engagement_to_conversion_rate,
            "avg_transaction_value": avg_transaction_value,
            "median_transaction_value": median_transaction_value,
            "total_transaction_value": total_transaction_value,
            "std_dev_transaction_value": std_dev_transaction_value
        }
    
    def _extract_transaction_value(self, event: Dict[str, Any]) -> Optional[float]:
        """
        Extract transaction value from a conversion event
        """
        properties = event.get("properties", {})
        
        # Try different possible property names
        for key in ["value", "amount", "transaction_value", "txn_value"]:
            if key in properties and properties[key] is not None:
                try:
                    return float(properties[key])
                except (ValueError, TypeError):
                    pass
        
        # Check in txn_data
        txn_data = properties.get("txn_data")
        txn_data = self._parse_json_safely(txn_data)
        
        if isinstance(txn_data, dict) and "value" in txn_data:
            try:
                return float(txn_data["value"])
            except (ValueError, TypeError):
                pass
        
        # Check in merged_txn_data if available
        if "merged_txn_data" in event:
            merged_data = event["merged_txn_data"]
            if isinstance(merged_data, dict) and "value" in merged_data:
                try:
                    return float(merged_data["value"])
                except (ValueError, TypeError):
                    pass
        
        return None
    
    def _calculate_daily_metrics(self, visits: List[Dict[str, Any]], engagement_events: List[Dict[str, Any]],
                               conversion_events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Calculate metrics for each day in the date range
        """
        # Create a dictionary to store metrics for each day
        daily_data = defaultdict(lambda: {"visits": 0, "engagement": 0, "transactions": 0})
        
        # Process visits
        for event in visits:
            date = self._extract_date(event.get("timestamp"))
            if date:
                daily_data[date]["visits"] += 1
        
        # Process engagement events
        for event in engagement_events:
            date = self._extract_date(event.get("timestamp"))
            if date:
                daily_data[date]["engagement"] += 1
        
        # Process conversion events
        for event in conversion_events:
            date = self._extract_date(event.get("timestamp"))
            if date:
                daily_data[date]["transactions"] += 1
        
        # Ensure all days in the range are included
        start_date = datetime.strptime(self.from_date, "%Y-%m-%d")
        all_days = []
        
        for i in range(self.days):
            current_date = (start_date + timedelta(days=i)).strftime("%Y-%m-%d")
            metrics = daily_data.get(current_date, {"visits": 0, "engagement": 0, "transactions": 0})
            all_days.append({
                "date": current_date,
                "visits": metrics["visits"],
                "engagement": metrics["engagement"],
                "transactions": metrics["transactions"]
            })
        
        return all_days
    
    def _extract_date(self, timestamp: Optional[str]) -> Optional[str]:
        """
        Extract date in YYYY-MM-DD format from timestamp
        """
        if not timestamp:
            return None
        
        try:
            dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
            return dt.strftime("%Y-%m-%d")
        except (ValueError, TypeError):
            return None
    
    def _calculate_weekly_metrics(self, daily_metrics: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Aggregate daily metrics into weekly metrics with WoW comparison
        """
        if not daily_metrics:
            return []
        
        # Group days into weeks
        weeks = []
        current_week = []
        week_number = 1
        
        for day_data in daily_metrics:
            current_week.append(day_data)
            
            # If we have 7 days or it's the last day, create a week
            if len(current_week) == 7 or day_data == daily_metrics[-1]:
                if current_week:
                    start_date = current_week[0]["date"]
                    end_date = current_week[-1]["date"]
                    
                    # Sum metrics for the week
                    visits = sum(day["visits"] for day in current_week)
                    engagement = sum(day["engagement"] for day in current_week)
                    transactions = sum(day["transactions"] for day in current_week)
                    
                    # Calculate conversion rate
                    conversion_rate = transactions / visits if visits > 0 else 0
                    
                    weeks.append({
                        "week": week_number,
                        "date_range": f"{start_date} to {end_date}",
                        "visits": visits,
                        "engagement": engagement,
                        "transactions": transactions,
                        "conversion_rate": conversion_rate
                    })
                    
                    week_number += 1
                    current_week = []
        
        # Calculate week-over-week changes
        for i in range(1, len(weeks)):
            prev_week = weeks[i-1]
            curr_week = weeks[i]
            
            # Calculate percentage changes
            curr_week["visits_wow"] = self._calculate_percentage_change(prev_week["visits"], curr_week["visits"])
            curr_week["engagement_wow"] = self._calculate_percentage_change(prev_week["engagement"], curr_week["engagement"])
            curr_week["transactions_wow"] = self._calculate_percentage_change(prev_week["transactions"], curr_week["transactions"])
            curr_week["conversion_rate_wow"] = self._calculate_percentage_change(prev_week["conversion_rate"], curr_week["conversion_rate"])
            
            # Add flags for significant changes
            curr_week["significant_change"] = any(
                abs(curr_week.get(f"{metric}_wow", 0)) > 0.2  # 20% change threshold
                for metric in ["visits", "engagement", "transactions", "conversion_rate"]
            )
        
        return weeks
    
    def _calculate_percentage_change(self, previous: float, current: float) -> float:
        """
        Calculate percentage change between two values
        """
        if previous == 0:
            return 1.0 if current > 0 else 0.0
        return (current - previous) / previous
    
    def _analyze_campaign_performance(self, visits: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyze performance by campaign, source, and medium
        """
        campaigns = defaultdict(lambda: {
            "visits": 0,
            "sources": defaultdict(int),
            "medium": defaultdict(int),
            "geo": defaultdict(int)
        })
        
        for event in visits:
            properties = event.get("properties", {})
            
            # Extract UTM parameters
            campaign = properties.get("utm_campaign", "direct")
            source = properties.get("utm_source", "direct")
            medium = properties.get("utm_medium", "direct")
            
            # Extract geographic data if available
            country = properties.get("$geoip_country_name", "unknown")
            
            # Update campaign data
            campaigns[campaign]["visits"] += 1
            campaigns[campaign]["sources"][source] += 1
            campaigns[campaign]["medium"][medium] += 1
            campaigns[campaign]["geo"][country] += 1
        
        return dict(campaigns)
    
    def _analyze_device_analytics(self, visits: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyze device and browser usage
        """
        devices = defaultdict(int)
        browsers = defaultdict(int)
        operating_systems = defaultdict(int)
        screen_sizes = defaultdict(int)
        
        for event in visits:
            properties = event.get("properties", {})
            
            # Extract device information
            device = properties.get("$device_type", properties.get("device", "unknown"))
            browser = properties.get("$browser", "unknown")
            os = properties.get("$os", "unknown")
            
            # Extract screen size if available
            screen_width = properties.get("$screen_width")
            screen_height = properties.get("$screen_height")
            screen_size = f"{screen_width}x{screen_height}" if screen_width and screen_height else "unknown"
            
            # Update counters
            devices[device] += 1
            browsers[browser] += 1
            operating_systems[os] += 1
            screen_sizes[screen_size] += 1
        
        # Calculate conversion rates by device and browser
        device_conversion_rates = self._calculate_device_conversion_rates(visits)
        
        return {
            "devices": dict(devices),
            "browsers": dict(browsers),
            "operating_systems": dict(operating_systems),
            "screen_sizes": dict(screen_sizes),
            "device_conversion_rates": device_conversion_rates
        }
    
    def _calculate_device_conversion_rates(self, visits: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Calculate conversion rates by device type
        """
        # This would require matching visits to conversions by user
        # Placeholder implementation
        return {}
    
    def _analyze_conversion_metrics(self, conversion_events: List[Dict[str, Any]], 
                                  visits: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyze detailed conversion metrics
        """
        # Extract referrer distribution
        referrer_distribution = defaultdict(int)
        for event in visits:
            properties = event.get("properties", {})
            referrer = properties.get("$referrer", "direct")
            referrer_distribution[referrer] += 1
        
        # Analyze transaction statistics
        transaction_stats = {
            "initiated": 0,
            "successful": 0,
            "failed": 0,
            "avg_value": 0,
            "median_value": 0,
            "total_value": 0
        }
        
        transaction_values = []
        for event in conversion_events:
            properties = event.get("properties", {})
            
            # Count initiated transactions
            transaction_stats["initiated"] += 1
            
            # Check if transaction was successful
            status = properties.get("status", "").lower()
            if status == "success" or status == "completed":
                transaction_stats["successful"] += 1
            elif status == "failed" or status == "error":
                transaction_stats["failed"] += 1
            
            # Extract transaction value
            value = self._extract_transaction_value(event)
            if value is not None:
                transaction_values.append(value)
        
        # Calculate transaction value statistics
        if transaction_values:
            transaction_stats["avg_value"] = sum(transaction_values) / len(transaction_values)
            transaction_stats["median_value"] = median(transaction_values) if len(transaction_values) >= 1 else 0
            transaction_stats["total_value"] = sum(transaction_values)
        
        return {
            "referrer_distribution": dict(referrer_distribution),
            "transaction_stats": transaction_stats
        }
    
    def _calculate_time_to_conversion(self, visits: List[Dict[str, Any]], 
                                    conversion_events: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Calculate time-to-conversion metrics
        """
        conversion_times = []
        for event in conversion_events:
            if "time_to_conversion" in event and event["time_to_conversion"] is not None:
                conversion_times.append(event["time_to_conversion"])
        
        if not conversion_times:
            return {
                "avg_minutes": 0,
                "median_minutes": 0,
                "distribution": {}
            }
        
        # Calculate average and median
        avg_minutes = sum(conversion_times) / len(conversion_times)
        median_minutes = median(conversion_times)
        
        # Create distribution buckets
        distribution = defaultdict(int)
        for minutes in conversion_times:
            if minutes < 5:
                bucket = "< 5 min"
            elif minutes < 30:
                bucket = "5-30 min"
            elif minutes < 60:
                bucket = "30-60 min"
            elif minutes < 24 * 60:
                bucket = "1-24 hours"
            else:
                bucket = "> 24 hours"
            distribution[bucket] += 1
        
        return {
            "avg_minutes": avg_minutes,
            "median_minutes": median_minutes,
            "distribution": dict(distribution)
        }

def check_events_data(team_id: int, from_date: datetime, days: int = 1):
    """
    Check what events are available in ClickHouse for the given team and date range.
    Returns a dictionary with event counts and time ranges.
    """
    from analytickit.client import sync_execute
    
    to_date = from_date + timedelta(days=days)
    
    # Query to get event counts by event name
    query = """
    SELECT 
        event,
        count(*) as count,
        min(timestamp) as min_time,
        max(timestamp) as max_time
    FROM events
    WHERE team_id = %(team_id)s
      AND timestamp >= %(from_date)s
      AND timestamp <= %(to_date)s
    GROUP BY event
    ORDER BY count DESC
    """
    
    params = {
        "team_id": team_id,
        "from_date": from_date,
        "to_date": to_date
    }
    
    print("\nAvailable events in Clickhouse:")
    
    results = []
    
    try:
        rows = sync_execute(query, params)
        
        for row in rows:
            event_name, count, min_time, max_time = row
            print(f"Event: {event_name}")
            print(f"Count: {count}")
            print(f"Time range: {min_time} to {max_time}")
            print("---")
            
            results.append({
                "event_name": event_name,
                "count": count,
                "min_time": min_time.isoformat() if min_time else None,
                "max_time": max_time.isoformat() if max_time else None
            })
        
        if not rows:
            print("No events found for this team and date range.")
            
    except Exception as e:
        print(f"Error checking events: {str(e)}")
        import traceback
        print(traceback.format_exc())
    
    return results 