export default {
  template: `
    <div class="row" id="beanMetrics">
      <div class="col-md-3"><bean-metric title="Nodes"
         bean="puppetlabs.puppetdb.population" name="num-nodes"></bean-metric></div>
      <div class="col-md-3"><bean-metric title="Resources"
         bean="puppetlabs.puppetdb.population" name="num-resources"></bean-metric></div>
      <div class="col-md-3"><bean-metric title="Avg Resources/Node"
         bean="puppetlabs.puppetdb.population" name="avg-resources-per-node"></bean-metric></div>
      <div class="col-md-3"><bean-metric title="Resource Duplication %"
        bean="puppetlabs.puppetdb.population" name="pct-resource-dupes" multiply="100">
      </bean-metric></div>
    </div>

    <div class="row">
      <div ng-class="'col-md-' + $ctrl.panelWidth" ng-repeat="panel in $ctrl.panels">
        <node-metric title="{{panel.name}}" query="{{panel.query}}" type="{{panel.type}}">
      </div>
    </div>

    <div class="row">
      <div class="col-md-4">
        <h3>Syntax</h3>
        <p>Use <code>fact=value</code> to search for nodes where <code>fact</code> equals
           <code>value</code>.
           To search for structured facts use dots between each part of the fact path, for example
           <code>foo.bar=baz</code>. </p>

        <p>Resources can be matched using the syntax <code>type[title]{param=value}</code>.
           The part in brackets is optional. You can also specify <code>~</code> before the
           <code>title</code>
           to do a regexp match on the title. Type names and class names are case insensitive.
           A resource can be preceded by <code>@@</code> to match exported resources, the default
           is to only match "local" resources.</p>

        <p>Strings can contain letters, numbers or the characters :-_ without needing to be quoted.
           If they contain any other characters they need to be quoted with single or double quotes.
           Use backslash (\) to escape quotes within a quoted string or double backslash for
           backslashes.</p>

        <p>An unquoted number or the strings true/false will be interpreted as numbers and boolean
           values, use quotation marks around them to search for them as strings instead.</p>

        <p>A <code>@</code> sign before a string causes it to be interpreted as a date parsed with
           <a href="https://github.com/calebcase/timespec">timespec</a>.
           For example <code>@"now - 2 hours"</code>.</p>

        <p>A <code>#</code> sign can be used to do a subquery, against the nodes endpoint for
           example to query the <code>report_timestamp</code>, <code>catalog_timestamp</code> or
           <code>facts_timestamp</code> fields.
           For example <code>#node.report_timestamp < @"now - 2 hours"</code>.</p>

        <p>A subquery using the <code>#</code> sign can have a block of expressions instead of a
           single expression. For example <code>#node { report_timestamp > @"now - 4 hours" and
           report_timestamp < @"now - 2 hours" }</code></p>

        <p>A bare string without comparison operator will be treated as a regexp match against the
           certname.</p>
      </div>

      <div class="col-md-4">
        <h4>Comparison operators</h4>

        <table class="table table-condensed table-striped">
          <tr><td>=</td><td>Equality</td></tr>
          <tr><td>!=</td><td>Not equal</td></tr>
          <tr><td>~</td><td>Regexp match</td></tr>
          <tr><td>!~</td><td>Not regexp match</td></tr>
          <tr><td>&lt;</td><td>Less than</td></tr>
          <tr><td>&lt;=</td><td>Less than or equal</td></tr>
          <tr><td>&gt;</td><td>Greater than</td></tr>
          <tr><td>&gt;=</td><td>Greater than or equal</td></tr>
        </table>

        <h4>Logical operators</h4>
        <table class="table table-condensed table-striped">
          <tr><td>not</td><td>(unary op)</td></tr>
          <tr><td>and</td><td></td></tr>
          <tr><td>or</td><td></td></tr>
        </table>
        <p>Shown in precedence order from highest to lowest. Use parenthesis to change order in an
           expression.</p>
      </div>

      <div class="col-md-4">
        <h3>Query Examples</h3>
        Nodes with package mysql-server and amd64 arcitecture
        <div class="well well-sm">
          <tt>package["mysql-server"] and architecture=amd64</tt>
        </div>
        Nodes with the class Postgresql::Server and a version set to 9.3
        <div class="well well-sm">
            <tt>class[postgresql::server]{ version="9.3" }</tt>
        </div>
        Nodes with 4 or 8 processors running Linux
        <div class="well well-sm">
            <tt>(processorcount=4 or processorcount=8) and kernel=Linux</tt>
        </div>
        Nodes that haven't reported in the last 2 hours
        <div class="well well-sm">
            <tt>#node.report_timestamp<@"now - 2 hours"</tt>
        </div>
      </div>
    </div>
  `,

  controller: class {
    constructor(puppetDB, config) {
      this.puppetDB = puppetDB;

      this.panels = config.get('dashboardPanels');
      this.panelWidth = Math.max(2, Math.floor(12 / this.panels.length));
      this.checkVersion();
    }

    checkVersion() {
      this.puppetDB.getVersion().then(
        (resp) => {
          this.major = parseInt(resp.data.version.split('.')[0], 10);
          this.minor = parseInt(resp.data.version.split('.')[1], 10);
          this.patch = parseInt(resp.data.version.split('.')[2], 10);
          if (this.major < 4 || (this.major === 3 && this.minor < 2)) {
            throw new Error('This version of Puppet Explorer requires puppetDB version 3.2.0+' +
              `, you are running puppetDB ${resp.data.version}`);
          }
        }
      );
    }
  },
};