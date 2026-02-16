from django.db import migrations


def normalize_wallet_addresses(apps, schema_editor):
    VisitorWalletAddress = apps.get_model("analytickit", "VisitorWalletAddress")
    for wallet in VisitorWalletAddress.objects.all():
        lower_addr = wallet.visitor_wallet_address.lower()
        if wallet.visitor_wallet_address != lower_addr:
            wallet.visitor_wallet_address = lower_addr
            wallet.save(update_fields=["visitor_wallet_address"])


class Migration(migrations.Migration):

    dependencies = [
        ("analytickit", "0014_visitorwalletaddress"),
    ]

    operations = [
        migrations.RunPython(
            normalize_wallet_addresses,
            reverse_code=migrations.RunPython.noop,
        ),
    ]
