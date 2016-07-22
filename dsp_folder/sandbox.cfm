<cfoutput>#Request.htmlErrors#</cfoutput>
<cfif NOT Local.displayDungeon>
  <div id="FORMS_elements">
    <form method="post" id="formSandbox"><cfoutput>
      <input type="hidden" name="module" value="#FormUrl.module#" />
      <ul class="width100pct fields50pct">
        <li>
          <label class="required" for="countX">Width:</label>
          <input type="text" id="countX" name="countX" maxlength="4" value="#NumberFormat(FormUrl.countX)#" />
        </li>
        <li>
          <label class="required" for="countY">Length:</label>
          <input type="text" id="countY" name="countY" maxlength="4" value="#NumberFormat(FormUrl.countY)#" />
        </li>
      </ul>
      <ul class="width100pct fields50pct">
        <li>
          <label class="required" for="countZ">Height:</label>
          <input type="text" id="countZ" name="countZ" maxlength="4" value="#NumberFormat(FormUrl.countZ)#" />
        </li>
      </ul>
      <div class="submitButtons">
        <button type="submit" id="sandbox_submit" name="sandbox_submit" value="1">Generate</button>
      </div>
    </cfoutput></form>
  </div>
<cfelse>
  <style type="text/css">
    canvas {
      background-color: black;
      height: 750px;
      width: 750px;
    }
  </style>
  <cfoutput>
    <input type="hidden" id="countX" value="#FormUrl.countX#" />
    <input type="hidden" id="countY" value="#FormUrl.countY#" />
    <input type="hidden" id="countZ" value="#FormUrl.countZ#" />
  </cfoutput>
  <script type="text/javascript" src="//code.jquery.com/jquery-3.1.0.js"></script>
  <script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/threejs/r76/three.min.js"></script>
  <script type="text/javascript" src="js/FlyControls.js"></script>
  <script type="text/javascript" src="js/sandbox.js"></script>
</cfif>