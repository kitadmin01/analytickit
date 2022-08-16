release: REDIS_URL='redis://' python manage.py migrate
web: gunicorn analytickit.wsgi --log-file -
worker: ./bin/docker-worker
celeryworker: ./bin/docker-worker-celery --with-scheduler # optional
pluginworker: ./bin/plugin-server # optional
