from typing import Optional

from analytickit.celery import app
from analytickit.models import Person


@app.task(ignore_result=True, max_retries=1)
def split_person(person_id: int, main_distinct_id: Optional[str]) -> None:
    """
    Split all distinct ids into separate persons
    """
    person = Person.objects.get(pk=person_id)
    person.split_person(main_distinct_id)
