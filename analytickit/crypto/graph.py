from django.shortcuts import render
from analytickit.models.crypto.comm_eng import CampaignAnalytic
import matplotlib.pyplot as plt

def active_users_chart(request, community_engagement_id):
    # Fetching data from the database
    analytics = CampaignAnalytic.objects.filter(
        community_engagement_id=community_engagement_id
    ).order_by('creation_ts')

    # Extracting timestamps and active users
    timestamps = [analytic.creation_ts for analytic in analytics]
    active_users = [analytic.active_users for analytic in analytics]

    # Plotting the graph
    plt.figure(figsize=(10, 6))
    plt.plot(timestamps, active_users, marker='o', linestyle='-', color='b')
    plt.title('Active Users Over Time')
    plt.xlabel('Time')
    plt.ylabel('Active Users')
    plt.grid(True)
    plt.tight_layout()

    # Save or display the plot
    plt.savefig('active_users_over_time.png')
    plt.show()

    # ... (you might pass the image path to the template, or use other ways to display it in the UI)

    return render(request, 'your_template_name.html', {'img_path': 'active_users_over_time.png'})
