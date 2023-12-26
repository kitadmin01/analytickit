import json
import stripe
from django.core.mail import send_mail
from django.conf import settings
from django.views.generic import TemplateView
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse, HttpResponse
from django.views import View
from enum import Enum
import structlog
from dpa.models import Billing
from analytickit.models.user import User
from analytickit.settings.utils import get_from_env, str_to_bool
from django.shortcuts import redirect


logger = structlog.get_logger(__name__)


stripe.api_key = settings.STRIPE_SECRET_KEY


class SuccessView(View):
    def get(self, request, *args, **kwargs):
        return redirect('/success')  # Redirect to React route for success

class CancelView(View):
    def get(self, request, *args, **kwargs):
        return redirect('/cancel')  # Redirect to React route for cancel


class Plan(Enum):
    STARTER_PLAN = 1
    GROWTH_PLAN = 2
    ENTERPRISE_PLAN = 3

PLAN_DETAILS = {
    Plan.STARTER_PLAN.value: {
        "name": "Starter Plan",
        "price": 118800,  # in cents, e.g., $118800.00
        "url": "https://example.com/starter-product-url",
        "image_url": "http://localhost:8000/static/starter-plan.svg"
    },
    Plan.GROWTH_PLAN.value: {
        "name": "Growth Plan",
        "price": 358800,  # in cents, e.g., $3588.00
        "url": "https://example.com/growth-product-url",
        "image_url": "http://localhost:8000/static/growth-plan.svg"
    },
    Plan.ENTERPRISE_PLAN.value: {
        "name": "Enterprise Plan",
        "price": 598800,  # in cents, e.g., $5988.00
        "url": "https://example.com/enterprise-product-url",
        "image_url": "http://localhost:8000/static/enterprise-plan.svg"
    }
}

def serialize_plan(plan_enum):
    plan_data = PLAN_DETAILS[plan_enum.value]
    return {
        "key": plan_enum.name,
        "name": plan_data["name"],
        "price_string": f"${plan_data['price']/100:.2f}",  # Convert price to a string with a dollar sign
        "url": plan_data["url"],
        "image_url": plan_data["image_url"]
    }



DEBUG = get_from_env("DEBUG", False, type_cast=str_to_bool)
HOST = "http://localhost:8000"
if not DEBUG:
    HOST = "https://dpa.analytickit.com"




def get_available_plans(request):
    plans = [serialize_plan(plan) for plan in Plan]
    return JsonResponse(plans, safe=False)



class ProductLandingPageView(TemplateView):
    '''
    This Django view renders the landing page for a given product ID.
    It passes the product object and the Stripe publishable key to the template.
    '''
    template_name = "landing.html"

    def get_context_data(self, **kwargs):
        '''
        This method gets the product object and the Stripe publishable key.
        '''
        product = Plan[self.kwargs["pk"]]
        context = super(ProductLandingPageView, self).get_context_data(**kwargs)
        context.update({
            "product": product,
            "stripe_publishable_key": settings.STRIPE_PUBLIC_KEY
        })
        self.logger.info(f"Found context {context}")
        return context



class CreateCheckoutSessionView(View):
    '''
    This Django view creates a Stripe Checkout session for a given product ID.
    It sets the session mode to 'payment' and specifies success and cancel URLs.
    It returns the ID of the created session.
    '''
    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
            print("data=",data)
            plan_key = data.get("plan").get("key")
            plan_id = Plan[plan_key].value

            logger.info(f"plan_id: {plan_id}")
            plan_details = PLAN_DETAILS.get(plan_id)

            checkout_session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[
                    {
                        'price_data': {
                            'currency': 'usd',
                            'unit_amount': plan_details["price"],
                            'product_data': {
                                'name': plan_details["name"],
                                # 'images': ['https://i.imgur.com/EHyR2nP.png'],
                            },
                        },
                        'quantity': 1,
                    },
                ],
                metadata={
                    "plan_id": plan_id
                },
                mode='payment',
                success_url=HOST + '/success/',
                cancel_url=HOST + '/cancel/',
               
            )
            print("checkout_session==========",checkout_session)
            return JsonResponse({
                'id': checkout_session.id,
                'result':"Success"
            })

        except stripe.error.StripeError as e:
            logger.error(f"Stripe error: {e}")
            return JsonResponse({"error": str(e)}, status=400)

        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            return JsonResponse({"error": "An unexpected error occurred."}, status=500)

# to test this webhook, you can use the Stripe CLI
# run command stripe listen --forward-to localhost:8000/checkout/webhooks/stripe/

@csrf_exempt
def stripe_webhook(request):
    '''
    This Django view creates a Stripe Checkout session for a given product ID. 
    It sets the session mode to 'payment' and specifies success and cancel URLs. 
    It returns the ID of the created session.
    '''
    payload = request.body
    sig_header = request.META['HTTP_STRIPE_SIGNATURE']
    event = None
    logger.info(f"stripe_webhook payload= {payload}")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except stripe.error.SignatureVerificationError as e:
        logger.error(f"Invalid Stripe signature: {e}")
        return HttpResponse(status=400)
    except ValueError as e:
        logger.error(f"Invalid payload: {e}")
        return HttpResponse(status=400)
    except Exception as e:
        logger.error(f"Unexpected error in stripe_webhook: {e}")
        return HttpResponse(status=500)

    # Handle the checkout.session.completed event
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        logger.info(f"checkout.session.completed== {session}")

        customer_email = session["customer_details"]["email"]
        plan_id = session["metadata"]["plan_id"]
        product = Plan(plan_id)

        # Database Integration: Insert into Billing table
        try:
            user = User.objects.get(email=customer_email)  # Assuming you have a User model with an email field
            billing_record = Billing(
                user=user,
                plan_name=product["name"],
                price=product["price"],
                # ... any other fields you want to set
            )
            billing_record.save()
        
            send_mail(
                subject="Here is your product",
                message=f"Thanks for your purchase. Here is the product you ordered. The URL is {product.url}",
                recipient_list=[customer_email],
                from_email="matt@test.com"
            )

        except User.DoesNotExist:
            logger.error(f"User with email {customer_email} not found in the database.")
            # Handle this error as appropriate for your application
        except Exception as e:
            logger.error(f"Error saving billing record: {e}")
            # Handle other exceptions as appropriate for your application

        # TODO - decide whether you want to send the file or the URL
    
    elif event["type"] == "payment_intent.succeeded":
        intent = event['data']['object']

        stripe_customer_id = intent["customer"]
        stripe_customer = stripe.Customer.retrieve(stripe_customer_id)

        customer_email = stripe_customer['email']
        plan_id = intent["metadata"]["plan_id"]

        product = Plan(plan_id)

        send_mail(
            subject="Here is your product",
            message=f"Thanks for your purchase. Here is the product you ordered. The URL is {product.url}",
            recipient_list=[customer_email],
            from_email="matt@test.com"
        )

    return HttpResponse(status=200)


@csrf_exempt
def intent_post(request):
    '''
    This Django view handles Stripe webhook events. It parses the payload and verifies the signature. 
    It handles checkout.session.completed and payment_intent.succeeded events, sends an email to the 
    customer with the product URL, and returns an HTTP response.
    '''
    try:
        req_json = json.loads(request.body)
        customer = stripe.Customer.create(email=req_json['email'])
        plan_id = 1
        product = Plan(plan_id)
        intent = stripe.PaymentIntent.create(
            amount=product.price,
            currency='usd',
            customer=customer['id'],
            metadata={
                "plan_id": product.id
            }
        )
        return JsonResponse({
            'client_secret': intent['client_secret']
        })
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error: {e}")
        return JsonResponse({"error": str(e)}, status=400)
    except Exception as e:
        logger.error(f"Unexpected error in intent_post: {e}")
        return JsonResponse({"error": "An unexpected error occurred."}, status=500)
        

