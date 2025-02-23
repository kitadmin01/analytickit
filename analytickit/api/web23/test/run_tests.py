import os
import sys
import django

# Add the project root to Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../..")))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'analytickit.settings')
django.setup()

from test_wallet_queries import test_get_consolidated_wallet_data

def run_tests():
    """
    Run all wallet query tests
    """
    print("\n🔍 Starting wallet query tests...")
    
    try:
        test_get_consolidated_wallet_data()
        print("\n✨ All tests completed successfully!")
        return 0
    except Exception as e:
        print(f"\n💥 Tests failed: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(run_tests()) 