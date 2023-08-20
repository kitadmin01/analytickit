from django.db import models


class ContractCalls(models.Model):
    call_id = models.AutoField(primary_key=True)
    contract_address = models.CharField(max_length=255)
    caller_address = models.CharField(max_length=255)
    function_signature = models.CharField(max_length=255)
    parameters = models.JSONField()
    transaction_hash = models.CharField(max_length=255)
    block_number = models.IntegerField()
    block_timestamp = models.DateTimeField()

    class Meta:
        db_table = "contract_calls"
