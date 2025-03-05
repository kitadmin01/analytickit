from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from collections import defaultdict
from django.db.models.functions import Lower
from analytickit.models.crypto.wallet_address import VisitorWalletAddress
from analytickit.client import sync_execute
import json

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
    
    def __init__(self, team_id: int, from_timestamp: datetime, days: int = 30):
        self.team_id = team_id
        self.from_timestamp = from_timestamp
        self.days = days

    def get_funnel_stages(self) -> Dict[str, Any]:
        """
        Get data for all funnel stages using existing functions
        """
        # Get all web2 events (both awareness and engagement)
        web2_events = self._get_web2_events()
        
        # Get web3 conversion events
        web3_data = self._get_web3_transactions(web2_events['unique_wallets'])
        
        # Process events into funnel stages
        awareness_metrics = self._process_awareness_events(web2_events['events'])
        engagement_metrics = self._process_engagement_events(web2_events['events'])
        conversion_metrics = self._process_conversion_events(web3_data)
        
        return {
            "awareness": awareness_metrics,
            "engagement": engagement_metrics,
            "conversion": conversion_metrics,
            "unique_wallets": web2_events['unique_wallets']
        }

    def _get_web2_events(self) -> Dict[str, Any]:
        """
        Get all web2 events using existing functions
        """
        # Get wallet login events
        login_events = get_wallet_login_events(
            team_id=self.team_id,
            event_name='WalletLogin',
            days=self.days,
            from_date=self.from_timestamp
        )

        # Get pageview events
        pageview_events = get_wallet_login_events( 
            team_id=self.team_id,
            event_name='Pageview',
            days=self.days,
            from_date=self.from_timestamp
        )

        # Combine all events
        all_events = login_events + pageview_events

        # Get unique wallets
        unique_wallets = set()
        for event in login_events:
            properties = event['properties']
            if isinstance(properties, str):
                try:
                    properties = json.loads(properties)
                    wallet = properties.get('$crypto_wallet_public_address')
                    if wallet:
                        unique_wallets.add(wallet.lower())
                except json.JSONDecodeError:
                    continue

        return {
            "events": all_events,
            "unique_wallets": list(unique_wallets)
        }

    def _process_awareness_events(self, events: List[Dict]) -> Dict[str, Any]:
        """
        Process awareness stage metrics (page visits, referrers)
        """
        daily_visits = defaultdict(int)
        referrer_counts = defaultdict(int)
        device_types = defaultdict(int)
        
        for event in events:
            properties = event['properties']
            if isinstance(properties, str):
                try:
                    properties = json.loads(properties)
                except json.JSONDecodeError:
                    continue
                    
            date_key = event['timestamp'].strftime('%Y-%m-%d')
            
            # Count page visits
            if event.get('event') == 'Pageview':
                daily_visits[date_key] += 1
                
                # Track referrers
                referrer = properties.get('$referrer', 'direct')
                referrer_counts[referrer] += 1
                
                # Track device types
                device_type = properties.get('$device_type', 'unknown')
                device_types[device_type] += 1
        
        return {
            "daily_visits": dict(daily_visits),
            "referrer_distribution": dict(referrer_counts),
            "device_distribution": dict(device_types),
            "total_visits": sum(daily_visits.values())
        }

    def _process_engagement_events(self, events: List[Dict]) -> Dict[str, Any]:
        """
        Process engagement stage metrics (campaign interactions, session data)
        """
        # Initialize nested defaultdict for campaign metrics
        campaign_metrics = defaultdict(lambda: {
            'visits': 0,
            'sources': defaultdict(int),
            'medium': defaultdict(int)
        })
        daily_engagement = defaultdict(int)
        browser_stats = defaultdict(int)
        
        for event in events:
            properties = event['properties']
            if isinstance(properties, str):
                try:
                    properties = json.loads(properties)
                except json.JSONDecodeError:
                    continue
                    
            date_key = event['timestamp'].strftime('%Y-%m-%d')
            
            # Track campaign data
            campaign = properties.get('utm_campaign', 'no_campaign')
            source = properties.get('utm_source', 'no_source')
            medium = properties.get('utm_medium', 'no_medium')
            
            # Update campaign metrics
            campaign_metrics[campaign]['visits'] += 1
            campaign_metrics[campaign]['sources'][source] += 1
            campaign_metrics[campaign]['medium'][medium] += 1
            
            # Track daily engagement
            daily_engagement[date_key] += 1
            
            # Track browser stats
            browser = properties.get('$browser', 'unknown')
            browser_stats[browser] += 1
        
        # Convert defaultdict to regular dict for JSON serialization
        campaign_metrics_dict = {}
        for campaign, data in campaign_metrics.items():
            campaign_metrics_dict[campaign] = {
                'visits': data['visits'],
                'sources': dict(data['sources']),
                'medium': dict(data['medium'])
            }
        
        return {
            "campaign_metrics": campaign_metrics_dict,
            "daily_engagement": dict(daily_engagement),
            "browser_distribution": dict(browser_stats),
            "total_engagement": sum(daily_engagement.values())
        }

    def _process_conversion_events(self, web3_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process conversion stage metrics (web3 transactions)
        """
        daily_transactions = defaultdict(lambda: {"initiated": 0, "successful": 0})
        transaction_values = []
        
        for tx in web3_data['transactions']:
            # Convert timestamp string to datetime
            date_key = datetime.fromisoformat(tx['timestamp']).strftime('%Y-%m-%d')
            
            # Handle txn_data as list or dict
            txn_data = tx.get('txn_data', [])
            if isinstance(txn_data, list):
                # If it's a list, process each transaction in the list
                for transaction in txn_data:
                    if isinstance(transaction, dict):
                        daily_transactions[date_key]["initiated"] += 1
                        if transaction.get('receipt_status') == 1:  # Successful transaction
                            daily_transactions[date_key]["successful"] += 1
                        
                        # Track transaction value if available
                        value = transaction.get('value')
                        if value and isinstance(value, (int, float, str)):
                            try:
                                value_float = float(value)
                                transaction_values.append(value_float)
                            except (ValueError, TypeError):
                                continue
            elif isinstance(txn_data, dict):
                # If it's a dictionary, process it directly
                daily_transactions[date_key]["initiated"] += 1
                if txn_data.get('receipt_status') == 1:
                    daily_transactions[date_key]["successful"] += 1
                    
                value = txn_data.get('value')
                if value and isinstance(value, (int, float, str)):
                    try:
                        value_float = float(value)
                        transaction_values.append(value_float)
                    except (ValueError, TypeError):
                        continue
        
        return {
            "daily_transactions": dict(daily_transactions),
            "total_initiated": sum(day["initiated"] for day in daily_transactions.values()),
            "total_successful": sum(day["successful"] for day in daily_transactions.values()),
            "avg_transaction_value": sum(transaction_values) / len(transaction_values) if transaction_values else 0,
            "total_transactions": len(transaction_values)
        }

    def generate_funnel_data(self) -> Dict[str, Any]:
        """
        Generate complete funnel analysis data with all stages
        """
        funnel_stages = self.get_funnel_stages()
        
        # Calculate date range for consistent reporting
        date_range = [
            (self.from_timestamp + timedelta(days=x)).strftime('%Y-%m-%d')
            for x in range(self.days)
        ]
        
        # Generate weekly date ranges
        weekly_ranges = []
        current_date = self.from_timestamp
        while current_date < self.from_timestamp + timedelta(days=self.days):
            week_end = min(current_date + timedelta(days=7), self.from_timestamp + timedelta(days=self.days))
            weekly_ranges.append({
                'start': current_date.strftime('%Y-%m-%d'),
                'end': (week_end - timedelta(days=1)).strftime('%Y-%m-%d'),
                'week_number': (current_date - self.from_timestamp).days // 7 + 1
            })
            current_date = week_end
        
        # Aggregate metrics by week
        weekly_metrics = []
        for week_range in weekly_ranges:
            start_date = datetime.strptime(week_range['start'], '%Y-%m-%d')
            end_date = datetime.strptime(week_range['end'], '%Y-%m-%d') + timedelta(days=1)
            
            # Get dates in this week
            week_dates = [
                d.strftime('%Y-%m-%d') for d in 
                [start_date + timedelta(days=x) for x in range((end_date - start_date).days)]
            ]
            
            # Aggregate metrics for this week
            weekly_metrics.append({
                'week': week_range['week_number'],
                'date_range': f"{week_range['start']} to {week_range['end']}",
                'visits': sum(funnel_stages['awareness']['daily_visits'].get(date, 0) for date in week_dates),
                'engagement': sum(funnel_stages['engagement']['daily_engagement'].get(date, 0) for date in week_dates),
                'transactions': sum(
                    funnel_stages['conversion']['daily_transactions'].get(date, {}).get('successful', 0) 
                    for date in week_dates
                ),
                'conversion_rate': round(
                    sum(funnel_stages['conversion']['daily_transactions'].get(date, {}).get('successful', 0) for date in week_dates) /
                    max(sum(funnel_stages['awareness']['daily_visits'].get(date, 0) for date in week_dates), 1) * 100, 2
                )
            })
        
        # Calculate week-over-week changes if we have multiple weeks
        if len(weekly_metrics) > 1:
            for i in range(1, len(weekly_metrics)):
                prev_week = weekly_metrics[i-1]
                curr_week = weekly_metrics[i]
                
                curr_week['visits_wow'] = self._calculate_percentage_change(curr_week['visits'], prev_week['visits'])
                curr_week['engagement_wow'] = self._calculate_percentage_change(curr_week['engagement'], prev_week['engagement'])
                curr_week['transactions_wow'] = self._calculate_percentage_change(curr_week['transactions'], prev_week['transactions'])
                curr_week['conversion_rate_wow'] = self._calculate_percentage_change(curr_week['conversion_rate'], prev_week['conversion_rate'])
        
        # Generate aggregated metrics
        funnel_data = {
            "metadata": {
                "team_id": self.team_id,
                "from_date": self.from_timestamp.strftime('%Y-%m-%d'),
                "to_date": (self.from_timestamp + timedelta(days=self.days)).strftime('%Y-%m-%d'),
                "days": self.days,
                "weeks": len(weekly_metrics)
            },
            "summary": {
                "total_visits": funnel_stages['awareness']['total_visits'],
                "total_engagement": funnel_stages['engagement']['total_engagement'],
                "total_conversions": funnel_stages['conversion']['total_successful'],
                "unique_wallets": len(funnel_stages['unique_wallets']),
                "overall_conversion_rate": round(
                    funnel_stages['conversion']['total_successful'] / 
                    max(funnel_stages['awareness']['total_visits'], 1) * 100, 2
                )
            },
            "daily_metrics": [
                {
                    "date": date,
                    "visits": funnel_stages['awareness']['daily_visits'].get(date, 0),
                    "engagement": funnel_stages['engagement']['daily_engagement'].get(date, 0),
                    "transactions": funnel_stages['conversion']['daily_transactions'].get(date, {}).get('successful', 0)
                }
                for date in date_range
            ],
            "weekly_metrics": weekly_metrics,
            "campaign_performance": funnel_stages['engagement']['campaign_metrics'],
            "device_analytics": {
                "devices": funnel_stages['awareness']['device_distribution'],
                "browsers": funnel_stages['engagement']['browser_distribution']
            },
            "conversion_metrics": {
                "referrer_distribution": funnel_stages['awareness']['referrer_distribution'],
                "transaction_stats": {
                    "initiated": funnel_stages['conversion']['total_initiated'],
                    "successful": funnel_stages['conversion']['total_successful'],
                    "avg_value": funnel_stages['conversion']['avg_transaction_value']
                }
            }
        }
        
        return funnel_data

    def _calculate_percentage_change(self, current, previous):
        """Helper function to calculate percentage change"""
        if previous == 0:
            return 100 if current > 0 else 0
        return round((current - previous) / previous * 100, 2)

    def _get_web3_transactions(self, wallet_addresses: List[str]) -> Dict[str, Any]:
        """
        Get on-chain token purchase events from Postgres using existing function
        """
        # Get transactions using existing function
        transactions = get_team_wallet_addresses(
            team_id=self.team_id,
            from_timestamp=self.from_timestamp
        )
        
        # Filter transactions for connected wallets if provided
        if wallet_addresses:
            wallet_addresses_lower = [addr.lower() for addr in wallet_addresses]
            transactions = [
                tx for tx in transactions 
                if tx['visitor_wallet_address'].lower() in wallet_addresses_lower
            ]
        
        # Process transactions into daily counts
        daily_purchases = defaultdict(int)
        transaction_details = []
        
        for tx in transactions:
            date_key = tx['visitor_wallet_address_ts'].strftime('%Y-%m-%d')
            daily_purchases[date_key] += 1
            transaction_details.append({
                'wallet': tx['visitor_wallet_address'],
                'timestamp': tx['visitor_wallet_address_ts'].isoformat(),
                'txn_data': tx['txn_data'],
                'token_transfer_data': tx['token_transfer_data']
            })
            
        return {
            "daily_purchases": dict(daily_purchases),
            "transactions": transaction_details
        }

def check_events_data(team_id: int, from_date: datetime, days: int = 1):
    """
    Debug function to check available events in Clickhouse
    """
    query = """
        SELECT 
            event,
            count(*) as count,
            min(timestamp) as min_time,
            max(timestamp) as max_time
        FROM default.events 
        WHERE team_id = %(team_id)s
        AND timestamp >= toDateTime(%(from_date)s)
        AND timestamp < toDateTime(%(to_date)s)
        GROUP BY event
    """
    
    to_date = from_date + timedelta(days=days)
    params = {
        "team_id": team_id,
        "from_date": from_date,
        "to_date": to_date
    }
    
    results = sync_execute(query, params)
    
    print("\nAvailable events in Clickhouse:")
    for event, count, min_time, max_time in results:
        print(f"Event: {event}")
        print(f"Count: {count}")
        print(f"Time range: {min_time} to {max_time}")
        print("---") 