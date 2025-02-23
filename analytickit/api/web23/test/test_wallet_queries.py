import os
import sys
import django
from datetime import datetime, timezone
import pytest

# Add the project root to Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../..")))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'analytickit.settings')
django.setup()

from analytickit.api.web23.wallet_queries import get_consolidated_wallet_data

def test_get_consolidated_wallet_data():
    """
    Test the get_consolidated_wallet_data function with actual data in databases
    """
    # Test parameters matching the actual data
    team_id = 1  # Assuming team_id is 1, adjust if different
    postgres_wallet = "0x17Fb866f05D0798fD73F0D3E373e1F9D07e14e25"  # Postgres wallet address
    clickhouse_wallet = "0x17fb866f05d0798fd73f0d3e373e1f9d07e14e26"  # Clickhouse wallet address
    from_timestamp = datetime(2025, 2, 2, tzinfo=timezone.utc)  # Setting timezone to UTC
    days = 3  # To cover dates from 2025-02-02 to 2025-02-04

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

        # Test without wallet address (should get all records)
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

if __name__ == "__main__":
    # Run the test
    test_get_consolidated_wallet_data() 