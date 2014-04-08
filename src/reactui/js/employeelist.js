/// <reference path="../../lib/react.d.ts" />
///
/// <reference path="js/employee.d.ts" />
var UIComponents;
(function (UIComponents) {
    UIComponents.EmployeeList = React.createClass({
        render: function () {
            var rows = [];
            for (var employee in this.props.employees) {
                console.log(employee);
                rows.push(UIComponents.Employee({
                    key: this.props.employees[employee].id,
                    employee: this.props.employees[employee]
                }));
            }
            ;
            console.log(rows);
            return (React.DOM.table(null, React.DOM.tbody(null, rows)));
        }
    });
})(UIComponents || (UIComponents = {}));
//# sourceMappingURL=employeelist.js.map
