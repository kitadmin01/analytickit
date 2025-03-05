import os
import sys
import django
from datetime import datetime, timezone, timedelta
import pytest

# Add the project root to Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../..")))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'analytickit.settings')
django.setup()

from analytickit.api.web23.wallet_queries import (
    get_consolidated_wallet_data, 
    get_wallet_login_events,
    get_person_events,
    UserFunnelAnalysis,
    check_events_data
)

def test_wallet_events():
    """
    Test the get_wallet_login_events function with different event names
    """
    team_id = 1
    wallet_address = "0x17fb866f05d0798fd73f0d3e373e1f9d07e14e26"
    from_date = datetime(2025, 2, 2, tzinfo=timezone.utc)
    days = 10

    try:
        # First check available events
        print("\n=== Checking Available Events ===")
        check_events_data(team_id, from_date, days)

        events_to_test = ['WalletLogin', 'Pageview']

        for event_name in events_to_test:
            print(f"\n=== Testing {event_name} Events ===")
            results = get_wallet_login_events(
                team_id=team_id,
                event_name=event_name,
                wallet_address=wallet_address,
                days=days,
                from_date=from_date
            )
            print(f"Found {len(results)} {event_name} events")
            
            if results:
                print("\nFirst event details:")
                first_event = results[0]
                print(f"Timestamp: {first_event['timestamp']}")
                print(f"Properties: {first_event['properties']}")
                print(f"Person Properties: {first_event['person_properties']}")
                print(f"Person ID: {first_event['person_id']}")

    except Exception as e:
        print(f"\n❌ Event test failed with error: {str(e)}")
        raise

def test_person_events():
    """
    Test the get_person_events function to retrieve all events for a person
    """
    team_id = 1
    person_id = "019383d4-6e08-0000-cdb8-3864ea453067"
    from_date = datetime(2025, 2, 2, tzinfo=timezone.utc)  # Match your data timestamp
    days = 10

    try:
        print("\n=== Testing Person Events ===")
        results = get_person_events(
            team_id=team_id,
            person_id=person_id,
            days=days,
            from_date=from_date
        )
        print(f"Found {len(results)} events for person {person_id}")
        
        if results:
            print("\nEvent details:")
            for idx, event in enumerate(results, 1):
                print(f"\nEvent {idx}:")
                print(f"Event Name: {event['event']}")
                print(f"Timestamp: {event['timestamp']}")
                print(f"Properties: {event['properties']}")
                print(f"Person Properties: {event['person_properties']}")
        else:
            print("No events found for this person")
            print(f"Date Range: {from_date} to {from_date + timedelta(days=days)}")

        # Optional: Add some basic assertions
        assert isinstance(results, list), "Results should be a list"
        if results:
            assert all(
                isinstance(event, dict) and 
                'event' in event and 
                'properties' in event and 
                'person_properties' in event and
                'timestamp' in event
                for event in results
            ), "Each event should have all required fields"

    except Exception as e:
        print(f"\n❌ Person events test failed with error: {str(e)}")
        raise

def test_get_consolidated_wallet_data():
    """
    Test the get_consolidated_wallet_data function with actual data in databases
    """
    # Test parameters matching the actual data
    team_id = 1
    postgres_wallet = "0x17Fb866f05D0798fD73F0D3E373e1F9D07e14e25"
    clickhouse_wallet = "0x17fb866f05d0798fd73f0d3e373e1f9d07e14e26"
    from_timestamp = datetime(2025, 2, 2, tzinfo=timezone.utc)
    days = 10

    try:
        # Test with Postgres wallet address
        print("\n=== Testing with Postgres wallet address ===")
        result_postgres = get_consolidated_wallet_data(
            team_id=team_id,
            wallet_address=postgres_wallet,
            from_timestamp=from_timestamp,
            days=days
        )
        print_results(result_postgres, "Postgres")

        # Test with Clickhouse wallet address
        print("\n=== Testing with Clickhouse wallet address ===")
        result_clickhouse = get_consolidated_wallet_data(
            team_id=team_id,
            wallet_address=clickhouse_wallet,
            from_timestamp=from_timestamp,
            days=days
        )
        print_results(result_clickhouse, "Clickhouse")

        # Test without wallet address
        print("\n=== Testing without wallet address ===")
        result_all = get_consolidated_wallet_data(
            team_id=team_id,
            from_timestamp=from_timestamp,
            days=days
        )
        print_results(result_all, "All Records")

    except Exception as e:
        print(f"\n❌ Test failed with error: {str(e)}")
        raise

def print_results(result: dict, test_type: str):
    """Helper function to print test results"""
    print(f"\n=== {test_type} Test Results ===")
    print(f"\nMetadata:")
    print(f"Team ID: {result['metadata']['team_id']}")
    print(f"Wallet Address: {result['metadata']['wallet_address']}")
    print(f"From Timestamp: {result['metadata']['from_timestamp']}")
    print(f"Days Lookback: {result['metadata']['days_lookback']}")

    print(f"\nWallet Data from Postgres:")
    print(f"Total Addresses: {result['wallet_data']['total_addresses']}")
    if result['wallet_data']['addresses']:
        print("\nWallet Address Records:")
        for addr in result['wallet_data']['addresses']:
            print(f"\nWallet Address: {addr['visitor_wallet_address']}")
            print(f"Timestamp: {addr['visitor_wallet_address_ts']}")
            print(f"Creation Time: {addr['creation_ts']}")

    print(f"\nLogin Events from Clickhouse:")
    print(f"Total Events: {result['login_events']['total_events']}")
    if result['login_events']['events']:
        print("\nLogin Events:")
        for event in result['login_events']['events']:
            print(f"\nProperties: {event['properties']}")
            print(f"Person Properties: {event['person_properties']}")
            print(f"Person ID: {event['person_id']}")

def test_funnel_analysis():
    """
    Test the UserFunnelAnalysis class
    """
    team_id = 1
    from_timestamp = datetime(2025, 2, 2, tzinfo=timezone.utc)
    days = 14  # Increased to 14 days to test weekly metrics

    try:
        print("\n=== Testing User Funnel Analysis ===")
        
        # Create funnel analysis instance
        funnel = UserFunnelAnalysis(
            team_id=team_id,
            from_timestamp=from_timestamp,
            days=days
        )
        
        # Generate funnel data
        funnel_data = funnel.generate_funnel_data()
        
        # Print summary with error handling
        print("\nFunnel Analysis Summary:")
        print(f"Team ID: {funnel_data['metadata']['team_id']}")
        print(f"Date Range: {funnel_data['metadata']['from_date']} to {funnel_data['metadata']['to_date']}")
        print(f"Total Days: {funnel_data['metadata']['days']}")
        print(f"Total Weeks: {funnel_data['metadata']['weeks']}")
        
        print("\nTotals:")
        print(f"Website Visits: {funnel_data['summary'].get('total_visits', 0)}")
        print(f"Engagement Events: {funnel_data['summary'].get('total_engagement', 0)}")
        print(f"Conversions: {funnel_data['summary'].get('total_conversions', 0)}")
        print(f"Unique Wallets: {funnel_data['summary'].get('unique_wallets', 0)}")
        print(f"Overall Conversion Rate: {funnel_data['summary'].get('overall_conversion_rate', 0)}%")
        
        print("\nDaily Metrics Sample:")
        for day in funnel_data.get('daily_metrics', [])[:3]:  # Show first 3 days
            print(f"\nDate: {day.get('date')}")
            print(f"Visits: {day.get('visits', 0)}")
            print(f"Engagement: {day.get('engagement', 0)}")
            print(f"Transactions: {day.get('transactions', 0)}")
        
        print("\nWeekly Metrics:")
        for week in funnel_data.get('weekly_metrics', []):
            print(f"\nWeek {week.get('week')}: {week.get('date_range')}")
            print(f"Visits: {week.get('visits', 0)}")
            print(f"Engagement: {week.get('engagement', 0)}")
            print(f"Transactions: {week.get('transactions', 0)}")
            print(f"Conversion Rate: {week.get('conversion_rate', 0)}%")
            
            # Print week-over-week changes if available
            if 'visits_wow' in week:
                print(f"Visits WoW: {week.get('visits_wow', 0)}%")
                print(f"Engagement WoW: {week.get('engagement_wow', 0)}%")
                print(f"Transactions WoW: {week.get('transactions_wow', 0)}%")
                print(f"Conversion Rate WoW: {week.get('conversion_rate_wow', 0)}%")

        # Add some basic assertions
        assert isinstance(funnel_data, dict), "Funnel data should be a dictionary"
        assert all(key in funnel_data for key in ['metadata', 'summary', 'daily_metrics', 'weekly_metrics']), "Missing required keys"
        assert len(funnel_data.get('daily_metrics', [])) == days, f"Should have {days} days of metrics"
        assert len(funnel_data.get('weekly_metrics', [])) > 0, "Should have weekly metrics"
        
        # Test weekly metrics
        if len(funnel_data.get('weekly_metrics', [])) > 1:
            second_week = funnel_data['weekly_metrics'][1]
            assert 'visits_wow' in second_week, "Week-over-week metrics should be calculated for second week"
        
        print("\n✅ Funnel analysis test completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Funnel analysis test failed with error: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        traceback.print_exc()
        raise

if __name__ == "__main__":
    # Run all tests
    print("\n🔍 Starting wallet event tests...")
    test_wallet_events()
    
    print("\n🔍 Starting person event tests...")
    test_person_events()
    
    print("\n🔍 Starting consolidated data tests...")
    test_get_consolidated_wallet_data()
    
    print("\n🔍 Starting funnel analysis test...")
    test_funnel_analysis()
    
    print("\n✨ All tests completed!") 