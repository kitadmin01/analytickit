import os
import sys
import django
from datetime import datetime, timezone, timedelta
import pytest
import json
from unittest.mock import patch, MagicMock
from django.test import TestCase

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
    check_events_data,
    get_team_wallet_addresses
)
from analytickit.models.crypto.wallet_address import VisitorWalletAddress

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
    days = 20  # Increased to 20 days to test weekly metrics

    try:
        print("\n=== Testing User Funnel Analysis ===")
        
        # Create funnel analysis instance with properly formatted date string
        funnel = UserFunnelAnalysis(
            team_id=team_id,
            from_date=from_timestamp.strftime("%Y-%m-%d"),
            days=days
        )
        
        # Generate funnel data
        funnel_data = funnel.get_funnel_data()
        
        # Check if there's an error in the response
        if 'error' in funnel_data:
            print(f"\nError in funnel data: {funnel_data['error']}")
            print("\n✅ Funnel analysis test completed with expected error (no data available)")
            return
        
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

class TestWalletQueries(TestCase):
    def setUp(self):
        # Create test data
        self.team_id = 1
        self.wallet_address = "0x123456789abcdef"
        self.from_date = datetime.now() - timedelta(days=30)
        
    @patch('analytickit.api.web23.wallet_queries.VisitorWalletAddress.objects.filter')
    def test_get_team_wallet_addresses(self, mock_filter):
        # Setup mock
        mock_query = MagicMock()
        mock_filter.return_value = mock_query
        mock_query.annotate.return_value = mock_query
        mock_query.filter.return_value = mock_query
        mock_query.values.return_value = mock_query
        mock_query.order_by.return_value = [
            {
                'visitor_wallet_address': self.wallet_address,
                'visitor_wallet_address_ts': self.from_date,
                'creation_ts': self.from_date,
                'update_ts': self.from_date,
                'community_engagement_id': '123',
                'team_id': self.team_id,
                'txn_data': json.dumps({'hash': '0xabc'}),
                'token_transfer_data': json.dumps({'token': 'ETH'})
            }
        ]
        
        # Call function
        result = get_team_wallet_addresses(self.team_id, self.from_date)
        
        # Assertions
        mock_filter.assert_called_once_with(team_id=self.team_id, visitor_wallet_address_ts__gte=self.from_date)
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]['visitor_wallet_address'], self.wallet_address)
        
    @patch('analytickit.api.web23.wallet_queries.sync_execute')
    def test_get_wallet_login_events(self, mock_execute):
        # Setup mock
        mock_execute.return_value = [
            ('WalletLogin', {'$crypto_wallet_public_address': self.wallet_address}, {}, '123', self.from_date)
        ]
        
        # Call function
        result = get_wallet_login_events(self.team_id, days=30, from_date=self.from_date)
        
        # Assertions
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]['event'], 'WalletLogin')
        self.assertEqual(result[0]['properties']['$crypto_wallet_public_address'], self.wallet_address)
        
    @patch('analytickit.api.web23.wallet_queries.get_team_wallet_addresses')
    @patch('analytickit.api.web23.wallet_queries.get_wallet_login_events')
    def test_get_consolidated_wallet_data(self, mock_login_events, mock_wallet_addresses):
        # Setup mocks
        mock_wallet_addresses.return_value = [
            {
                'visitor_wallet_address': self.wallet_address,
                'visitor_wallet_address_ts': self.from_date,
                'team_id': self.team_id
            }
        ]
        mock_login_events.return_value = [
            {
                'event': 'WalletLogin',
                'properties': {'$crypto_wallet_public_address': self.wallet_address},
                'person_id': '123',
                'timestamp': self.from_date
            }
        ]
        
        # Call function
        result = get_consolidated_wallet_data(self.team_id, from_timestamp=self.from_date)
        
        # Assertions
        self.assertEqual(result['wallet_data']['total_addresses'], 1)
        self.assertEqual(result['login_events']['total_events'], 1)
        self.assertEqual(result['metadata']['team_id'], self.team_id)
        
    @patch('analytickit.api.web23.wallet_queries.sync_execute')
    def test_get_person_events(self, mock_execute):
        # Setup mock
        mock_execute.return_value = [
            ('pageview', {'url': 'https://example.com'}, {}, self.from_date)
        ]
        
        # Call function
        result = get_person_events(self.team_id, '123', days=30, from_date=self.from_date)
        
        # Assertions
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]['event'], 'pageview')
        self.assertEqual(result[0]['properties']['url'], 'https://example.com')

class TestUserFunnelAnalysis(TestCase):
    def setUp(self):
        self.team_id = 1
        self.from_date = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
        self.days = 30
        
        # Sample event data for testing
        self.sample_events = [
            {
                "event": "$pageview",
                "properties": {
                    "url": "https://example.com",
                    "$device_type": "desktop",
                    "$browser": "Chrome",
                    "$os": "Windows",
                    "$referrer": "google.com",
                    "utm_campaign": "spring_sale",
                    "utm_source": "google",
                    "utm_medium": "cpc"
                },
                "distinct_id": "user1",
                "timestamp": (datetime.now() - timedelta(days=25)).isoformat()
            },
            {
                "event": "login",
                "properties": {
                    "wallet_address": "0x123456789abcdef",
                    "$device_type": "desktop",
                    "$browser": "Chrome"
                },
                "distinct_id": "user1",
                "timestamp": (datetime.now() - timedelta(days=24)).isoformat()
            },
            {
                "event": "transaction",
                "properties": {
                    "wallet_address": "0x123456789abcdef",
                    "value": "100.5",
                    "status": "success",
                    "txn_data": json.dumps({
                        "hash": "0xabc123",
                        "value": "100.5"
                    })
                },
                "distinct_id": "user1",
                "timestamp": (datetime.now() - timedelta(days=23)).isoformat()
            }
        ]
    
    def test_init(self):
        analysis = UserFunnelAnalysis(self.team_id, self.from_date, self.days)
        self.assertEqual(analysis.team_id, self.team_id)
        self.assertEqual(analysis.from_date, self.from_date)
        self.assertEqual(analysis.days, self.days)
        
    @patch.object(UserFunnelAnalysis, '_fetch_events')
    def test_get_funnel_data_empty(self, mock_fetch_events):
        # Test with no events
        mock_fetch_events.return_value = []
        
        analysis = UserFunnelAnalysis(self.team_id, self.from_date, self.days)
        result = analysis.get_funnel_data()
        
        self.assertIn("error", result)
        self.assertEqual(result["error"], "No funnel data available for this team.")
        
    @patch.object(UserFunnelAnalysis, '_fetch_events')
    def test_get_funnel_data_complete(self, mock_fetch_events):
        # Test with sample events
        mock_fetch_events.return_value = self.sample_events
        
        analysis = UserFunnelAnalysis(self.team_id, self.from_date, self.days)
        result = analysis.get_funnel_data()
        
        # Check that all expected sections are present
        self.assertIn("metadata", result)
        self.assertIn("summary", result)
        self.assertIn("daily_metrics", result)
        self.assertIn("weekly_metrics", result)
        self.assertIn("campaign_performance", result)
        self.assertIn("device_analytics", result)
        self.assertIn("conversion_metrics", result)
        self.assertIn("time_to_conversion", result)
        
        # Check metadata
        self.assertEqual(result["metadata"]["team_id"], self.team_id)
        self.assertEqual(result["metadata"]["from_date"], self.from_date)
        
        # Check summary metrics
        summary = result["summary"]
        self.assertEqual(summary["total_visits"], 1)
        self.assertEqual(summary["total_engagement"], 1)
        self.assertEqual(summary["total_conversions"], 1)
        self.assertEqual(summary["unique_wallets"], 1)
        
    def test_parse_json_safely(self):
        analysis = UserFunnelAnalysis(self.team_id, self.from_date, self.days)
        
        # Test with valid JSON string
        valid_json = '{"key": "value"}'
        result = analysis._parse_json_safely(valid_json)
        self.assertEqual(result, {"key": "value"})
        
        # Test with invalid JSON string
        invalid_json = '{key: value}'
        result = analysis._parse_json_safely(invalid_json)
        self.assertEqual(result, invalid_json)
        
        # Test with non-string input
        dict_input = {"key": "value"}
        result = analysis._parse_json_safely(dict_input)
        self.assertEqual(result, dict_input)
        
    def test_merge_transaction_data(self):
        analysis = UserFunnelAnalysis(self.team_id, self.from_date, self.days)
        
        # Test with dict inputs
        txn_data = {"hash": "0xabc", "value": "100"}
        token_data = {"token": "ETH", "amount": "1.5"}
        
        result = analysis._merge_transaction_data(txn_data, token_data)
        self.assertEqual(result["hash"], "0xabc")
        self.assertEqual(result["value"], "100")
        self.assertIn("token_transfers", result)
        self.assertEqual(len(result["token_transfers"]), 1)
        self.assertEqual(result["token_transfers"][0]["token"], "ETH")
        
        # Test with list inputs
        txn_data_list = [{"hash": "0xabc", "value": "100"}]
        token_data_list = [{"token": "ETH", "amount": "1.5"}, {"token": "USDC", "amount": "50"}]
        
        result = analysis._merge_transaction_data(txn_data_list, token_data_list)
        self.assertEqual(result["hash"], "0xabc")
        self.assertEqual(result["value"], "100")
        self.assertIn("token_transfers", result)
        self.assertEqual(len(result["token_transfers"]), 2)
        self.assertEqual(result["token_transfers"][0]["token"], "ETH")
        self.assertEqual(result["token_transfers"][1]["token"], "USDC")
        
    def test_extract_wallet_address(self):
        analysis = UserFunnelAnalysis(self.team_id, self.from_date, self.days)
        
        # Test with different property names
        properties = {
            "wallet_address": "0xabc",
            "walletAddress": "0xdef",
            "$wallet_address": "0x123",
            "wallet": "0x456"
        }
        
        # Should return the first one it finds
        result = analysis._extract_wallet_address(properties)
        self.assertEqual(result, "0xabc")
        
        # Test with empty properties
        result = analysis._extract_wallet_address({})
        self.assertIsNone(result)
        
    def test_calculate_time_difference(self):
        analysis = UserFunnelAnalysis(self.team_id, self.from_date, self.days)
        
        # Test with valid timestamps
        start = "2023-01-01T10:00:00Z"
        end = "2023-01-01T10:30:00Z"
        
        result = analysis._calculate_time_difference(start, end)
        self.assertEqual(result, 30)  # 30 minutes difference
        
        # Test with invalid timestamps
        result = analysis._calculate_time_difference("invalid", end)
        self.assertIsNone(result)
        
    def test_calculate_percentage_change(self):
        analysis = UserFunnelAnalysis(self.team_id, self.from_date, self.days)
        
        # Test normal case
        result = analysis._calculate_percentage_change(100, 120)
        self.assertEqual(result, 0.2)  # 20% increase
        
        # Test with zero previous value
        result = analysis._calculate_percentage_change(0, 10)
        self.assertEqual(result, 1.0)  # Special case for zero previous
        
        # Test with zero current value
        result = analysis._calculate_percentage_change(10, 0)
        self.assertEqual(result, -1.0)  # 100% decrease
        
        # Test with zero both values
        result = analysis._calculate_percentage_change(0, 0)
        self.assertEqual(result, 0.0)  # No change
        
    def test_extract_transaction_value(self):
        analysis = UserFunnelAnalysis(self.team_id, self.from_date, self.days)
        
        # Test with direct property
        event = {
            "properties": {
                "value": "100.5"
            }
        }
        result = analysis._extract_transaction_value(event)
        self.assertEqual(result, 100.5)
        
        # Test with txn_data as JSON string
        event = {
            "properties": {
                "txn_data": '{"value": "200.5"}'
            }
        }
        result = analysis._extract_transaction_value(event)
        self.assertEqual(result, 200.5)
        
        # Test with merged_txn_data
        event = {
            "properties": {},
            "merged_txn_data": {
                "value": "300.5"
            }
        }
        result = analysis._extract_transaction_value(event)
        self.assertEqual(result, 300.5)
        
        # Test with no value
        event = {
            "properties": {}
        }
        result = analysis._extract_transaction_value(event)
        self.assertIsNone(result)

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