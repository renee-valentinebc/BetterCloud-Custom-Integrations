#Zendesk

## Authentication
Basic Auth
username: your-username/token <br>
password: your-api-token

## Reference Docs
ZenDesk API Docs:
* https://developer.zendesk.com/api-reference/ticketing/users/users/#search-users

## Notes

## Environment Variables
* domain

## Actions
### Assign User To Custom Role
Pre-Request Scripts:
1. getUserId
2. getCustomRoleId

Method: PUT <br>
Endpoint URL: https://{{secrets.domain}}/api/v2/users/{userId}

Payload:
```json
{
  "email": "Test Value",
  "customRoleName": "Test Value"
}
```

### Unassign User From Custom Role
Pre-Request Scripts:
1. getUserId
2. formatUnassignCustomRole

Method: PUT <br>
Endpoint URL: https://{{secrets.domain}}/api/v2/users/{userId}

Payload:
```json
{
  "email": "Test Value"
}
```

### Add User To Group
Pre-Request Scripts:
1. getUserId
2. getGroupId
3. addUserIdToGroupMembershipBody

Method: POST <br>
Endpoint URL: https://{{secrets.domain}}/api/v2/users/{userId}/group_memberships

Payload:
```json
{
  "groupName": "Test Value",
  "email": "Test Value"
}
```

### Remove User from Group
Pre-Request Scripts:
1. removeUserFromGroup

Method: DELETE <br>
Endpoint URL: https://{{secrets.domain}}/api/v2/users/{userId}/group_memberships/{groupMembershipId}

Payload:
```json
{
  "email": "Test Value",
  "groupName": "Test Value"
}
```

### Add User To Organization
Pre-Request Scripts:
1. getUserId
2. getOrganizationid
3. addUserIdToOrganizationMembershipBody

Method: POST <br>
Endpoint URL: https://{{secrets.domain}}/api/v2/users/{userId}/organization_memberships

Payload:
```json
{
  "email": "Test Value",
  "organizationName": "Test Value"
}
```

### Remove User from Organization
Pre-Request Scripts:
1. removeUserFromOrganization

Method: DELETE <br>
Endpoint URL: https://{{secrets.domain}}/api/v2/users/{userId}/organization_memberships/{organizationMembershipId}.json

Payload:
```json
{
  "email": "Test Value",
  "organizationName": "Test Value"
}
```
