


class AddCaresoft:
    def __init__(self, ticket=None, username=None, phone=None, city_id=None, district_id=None, address=None, email=None, ticket_subject=None, ticket_comment=None, assignee_id=None, group_id=None, service_id=None, custom_fields=None, requester_id=None, ref_url=None, is_public=None, duedate=None, follow_user=None, ticket_status=None, ticket_priority=None, cc_user=None, campaign_id=None, member_status_id=None, tickets_ref_url=None):
        self.ticket = ticket
        self.username = username
        self.phone = phone
        self.city_id = city_id
        self.district_id = district_id
        self.address = address
        self.email = email
        self.ticket_subject = ticket_subject
        self.ticket_comment = ticket_comment
        self.assignee_id = assignee_id
        self.group_id = group_id
        self.service_id = service_id
        self.custom_fields = custom_fields
        self.requester_id = requester_id
        self.ref_url = ref_url
        self.is_public = is_public
        self.duedate = duedate
        self.follow_user = follow_user
        self.ticket_status = ticket_status
        self.ticket_priority = ticket_priority
        self.cc_user = cc_user
        self.campaign_id = campaign_id
        self.member_status_id = member_status_id
        self.tickets_ref_url = tickets_ref_url


class Ticket:
    def __init__(self, ticket_no=None, ticket_status=None, ticket_subject=None, ticket_priority=None, ticket_id=None, requester_id=None, assignee_id=None, created_at=None, updated_at=None, group_id=None, ticket_source=None, duedate=None, satisfaction=None, satisfaction_at=None, satisfaction_send=None, satisfaction_content=None, campaign_id=None, automessage_id=None, is_overdue=None, incident_id=None, service_id=None, ticket_source_detail_id=None, comments=None, custom_filed=None, assignee=None, requester=None, tags=None, ccs=None, follows=None, ticket_type=None):
        self.ticket_no = ticket_no
        self.ticket_status = ticket_status
        self.ticket_subject = ticket_subject
        self.ticket_priority = ticket_priority
        self.ticket_id = ticket_id
        self.requester_id = requester_id
        self.assignee_id = assignee_id
        self.created_at = created_at
        self.updated_at = updated_at
        self.group_id = group_id
        self.ticket_source = ticket_source
        self.duedate = duedate
        self.satisfaction = satisfaction
        self.satisfaction_at = satisfaction_at
        self.satisfaction_send = satisfaction_send
        self.satisfaction_content = satisfaction_content
        self.campaign_id = campaign_id
        self.automessage_id = automessage_id
        self.is_overdue = is_overdue
        self.incident_id = incident_id
        self.service_id = service_id
        self.ticket_source_detail_id = ticket_source_detail_id
        self.comments = comments
        self.custom_filed = custom_filed
        self.assignee = assignee
        self.requester = requester
        self.tags = tags
        self.ccs = ccs
        self.follows = follows
        self.ticket_type = ticket_type

