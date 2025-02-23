from typing import List, Dict, Any
from datetime import datetime, timedelta
from django.db.models.functions import Lower
from analytickit.models.crypto.wallet_address import VisitorWalletAddress
from analytickit.client import sync_execute

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

def get_wallet_login_events(team_id: int, wallet_address: str = None, days: int = 1) -> List[Dict[str, Any]]:
    """
    Retrieve wallet login events from Clickhouse for a given team_id, wallet address and time period
    
    Args:
        team_id: The ID of the team to query for
        wallet_address: Wallet address to filter by (case-insensitive)
        days: Number of days to look back (default: 1)
        
    Returns:
        List of dictionaries containing properties, person_properties and person_id
    """
    base_query = """
        SELECT 
            properties,
            person_properties,
            person_id
        FROM default.events 
        WHERE event = 'WalletLogin'
        AND timestamp >= today() - INTERVAL %(days)s DAY 
        AND team_id = %(team_id)s
    """
    
    params = {
        "team_id": team_id,
        "days": days
    }
    
    if wallet_address:
        # Add case-insensitive wallet address filtering
        wallet_query = """
            AND lower(JSONExtractString(properties, '$crypto_wallet_public_address')) = lower(%(wallet_address)s)
        """
        base_query += wallet_query
        params["wallet_address"] = wallet_address
    
    results = sync_execute(base_query, params)
    
    # Convert results to list of dictionaries
    events_data = [
        {
            "properties": result[0],
            "person_properties": result[1],
            "person_id": result[2]
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

    # Get login events
    login_events = get_wallet_login_events(
        team_id=team_id,
        wallet_address=wallet_address,
        days=days
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