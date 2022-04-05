# BetterCloud <> BambooHR Trigger Integration

## Best Practices
* For onboarding, do not monitor off status = "active" IF Onboarding Date !== Creation Date OR not all crucial information is filled out upon creation.
  * Questions to Ask during Scoping:
      * When a user is created, is all the information that you plan to send to BetterCloud inputted upon creation?
      * Do you onboard as soon as a user is created? Or is that usually at a later date?
  * Reasoning:
    * BambooHR sets users' status to "active" upon creation. This poses several issues:
      * You may not want the onboarding webhook to fire when your user is created. Onboarding date may be different from creation date.
      * Not all of user's info is inputted upon creation. For example, work email may be filled in at a later date, which will break workflows.
      * All  the "Field Change" (department, job title, etc.) webhooks will fire upon creation since BambooHR treats a new user creation as field changes for all fields. See [Preventing BambooHR Infinite Retries] 

  * Suggestions:
    * Monitor off of work email or some field that is known to be the last thing to be filled out. Only fill out when user should be onboarded.
* It's best to encourage creating and inputting email for a new BambooHR user. Email write backs.:
  * Questions to Ask During Scoping:
    * Will workEmail be constructed and inputted into BambooHR upon creation? Or is workEmail usually created at a later time and then inputted into BambooHR after?
  * Reasoning:
    * If the email is inputted at the beginning, there will be no need for an email write-back to Bamboo. 

## Preventing BambooHR Infinite Retries
When you create a webhook in BambooHR - it will attempt to send all changes from the inception of the webhook to the endpoint until it receives a 200 for those events, indefinitely. If there are issues, a collection of events will continue to grow which can cause issues on BetterCloud due to API limits.

To prevent this, we make sure that our triage scripts properly conditions off the fields that are sent from BambooHR as well as properly handles failed conditions.

Consider this chunk of code that is taken from the triage script. We make sure to condition off the "triggering" field, in this case it is work email, in multiple areas. The first case is to make sure a user isn't onboarded upon creation. The second case is to prevent the "Field Change" webhook for "department" from firing upon creation. **It's important to note that we do not error out on failed conditions, since that will force BambooHR to retry that webhook.**
```javascript
 switch (changedField) {
    case "workEmail":
        if (workEmail !== null && status === "Active") {
            url = secrets.onboardingTrigger;
            statusEmail += `User created in BambooHR and work email was set. Employee data: ${JSON.stringify(employee.fields)}\n`;
        }
        break;
    case "department":
        if (workEmail !== null) {
            url = secrets.departmentChangeTrigger;
            statusEmail += `User's department changed in BambooHR. Employee data: ${JSON.stringify(employee.fields)}\n`
        }
        statusEmail += `Department changed, but Work Email is not set. Perhaps this is a new user? BetterCloud workflow will not run. Employee data: ${JSON.stringify(employee.fields)}\n`;
        break;
```