import os
import sys
import django
import pytest

# Add the project root to Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../..")))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'analytickit.settings')
django.setup()

@pytest.fixture(autouse=True)
def enable_db_access_for_all_tests(db):
    pass 