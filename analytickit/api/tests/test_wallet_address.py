from django.test import TestCase
from django.utils import timezone

from analytickit.models import Organization, Team
from analytickit.models.crypto.wallet_address import VisitorWalletAddress


class TestWalletAddressCaseNormalization(TestCase):
    """Tests that wallet addresses are normalized to lowercase on save."""

    def setUp(self):
        self.org = Organization.objects.create(name="Test Org")
        self.team = Team.objects.create(organization=self.org, name="Test Team")

    def test_save_normalizes_to_lowercase(self):
        wallet = VisitorWalletAddress.objects.create(
            visitor_wallet_address="0xEcD302232E70B5078B5B8FE190FC7241BB538CC6",
            visitor_wallet_address_ts=timezone.now(),
            team=self.team,
            txn_data=[],
            token_transfer_data=[],
        )
        self.assertEqual(
            wallet.visitor_wallet_address,
            "0xecd302232e70b5078b5b8fe190fc7241bb538cc6",
        )

    def test_save_already_lowercase_unchanged(self):
        wallet = VisitorWalletAddress.objects.create(
            visitor_wallet_address="0xecd302232e70b5078b5b8fe190fc7241bb538cc6",
            visitor_wallet_address_ts=timezone.now(),
            team=self.team,
            txn_data=[],
            token_transfer_data=[],
        )
        self.assertEqual(
            wallet.visitor_wallet_address,
            "0xecd302232e70b5078b5b8fe190fc7241bb538cc6",
        )

    def test_save_mixed_case_normalizes(self):
        wallet = VisitorWalletAddress.objects.create(
            visitor_wallet_address="0x17Fb866f05D0798fD73F0D3E373e1F9D07e14e25",
            visitor_wallet_address_ts=timezone.now(),
            team=self.team,
            txn_data=[],
            token_transfer_data=[],
        )
        self.assertEqual(
            wallet.visitor_wallet_address,
            "0x17fb866f05d0798fd73f0d3e373e1f9d07e14e25",
        )

    def test_update_normalizes_to_lowercase(self):
        wallet = VisitorWalletAddress.objects.create(
            visitor_wallet_address="0xabc",
            visitor_wallet_address_ts=timezone.now(),
            team=self.team,
            txn_data=[],
            token_transfer_data=[],
        )
        wallet.visitor_wallet_address = "0xABC123DEF456789012345678901234567890ABCD"
        wallet.save()
        wallet.refresh_from_db()
        self.assertEqual(
            wallet.visitor_wallet_address,
            "0xabc123def456789012345678901234567890abcd",
        )

    def test_lookup_case_insensitive(self):
        VisitorWalletAddress.objects.create(
            visitor_wallet_address="0xEcD302232E70B5078B5B8FE190FC7241BB538CC6",
            visitor_wallet_address_ts=timezone.now(),
            team=self.team,
            txn_data=[],
            token_transfer_data=[],
        )
        # After normalization, searching lowercase should find it
        found = VisitorWalletAddress.objects.filter(
            visitor_wallet_address="0xecd302232e70b5078b5b8fe190fc7241bb538cc6"
        ).exists()
        self.assertTrue(found)
