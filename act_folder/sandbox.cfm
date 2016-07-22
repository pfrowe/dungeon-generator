<cfswitch expression="#Request.action#">
  <cfcase value="Init">
    <cfset Request.pageTitle = "Dynamic Dungeon" />
    <cfset Local.displayDungeon = false />
    <cfset Local.tryPost = StructKeyExists(FormUrl, "sandbox_submit") AND (FormUrl.sandbox_submit EQ 1) />
    <cfset Local.errorChecker = CreateObject(ToObjectPath("#Request.roots.cfc#/errorchecker")).Init() />
    <cfset Local.errorChecker.AddField("countX", 10) />
    <cfset Local.errorChecker.AddField("countY", 10) />
    <cfset Local.errorChecker.AddField("countZ", 10) />
    <cfset Local.errorChecker.AddRangeNumValidation(
      fieldName="countX", minRange="1", useDefaultIfInvalid=true, FIELD_NAME="width"
    ) />
    <cfset Local.errorChecker.AddRangeNumValidation(
      fieldName="countY", minRange="1", useDefaultIfInvalid=true, FIELD_NAME="length"
    ) />
    <cfset Local.errorChecker.AddRangeNumValidation(
      fieldName="countZ", minRange="1", useDefaultIfInvalid=true, FIELD_NAME="height"
    ) />
    <cfset Local.errorChecker.AddRegexValidation(
      fieldName="countX", testPattern="^\d+$", useDefaultIfInvalid=true, FIELD_NAME="width"
    ) />
    <cfset Local.errorChecker.AddRegexValidation(
      fieldName="countY", testPattern="^\d+$", useDefaultIfInvalid=true, FIELD_NAME="length"
    ) />
    <cfset Local.errorChecker.AddRegexValidation(
      fieldName="countZ", testPattern="^\d+$", useDefaultIfInvalid=true, FIELD_NAME="height"
    ) />
    <cfset Local.errors = Local.errorChecker.GetErrors(FormUrl) />
    <cfset Request.action = "" />
    <cfset Request.htmlErrors = "" />
    <cfif Local.tryPost>
      <cfset Local.doPost = Local.tryPost AND StructIsEmpty(Local.errors) />
      <cfif Local.doPost><cfset Request.action = "GenerateDungeon" />
      <cfelse><cfset Request.htmlErrors = Local.errorChecker.GetErrorDisplay(Local.errors) />
      </cfif>
    </cfif>
  </cfcase>
  <cfcase value="GenerateDungeon">
    <cfset Request.action = "" />
    <cfset Local.displayDungeon = true />
  </cfcase>
</cfswitch>