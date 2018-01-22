import * as React from 'react';
import * as Icon from 'react-fontawesome';
import { Collapse, Badge } from 'reactstrap';
import Moment from 'react-moment';
import { Link } from 'react-router-dom';
import * as hash from 'object-hash';

import * as PuppetDB from '../../../PuppetDB';

type Props = {
  readonly event: PuppetDB.eventT;
  readonly showNode: boolean;
};

type State = { readonly show: boolean };

export default class EventListItem extends React.Component<Props, State> {
  // Return the CSS class event states should correspond to
  static color(status: string): string {
    switch (status) {
      case 'success':
        return 'success';
      case 'noop':
        return 'text-muted';
      case 'failure':
        return 'danger';
      case 'skipped':
        return 'warning';
      default:
        return '';
    }
  }

  // Format the value column
  static formatValue(event: PuppetDB.eventT, value: string): JSX.Element {
    const matches =
      typeof value === 'string' ? value.match(/\{(\w{3,5})\}(\w+)/) : null;
    // Check if it is a file checksum
    if (
      event.resource_type === 'File' &&
      event.property === 'content' &&
      matches != null
    ) {
      // TODO: checksum tooltip
      return (
        <td>
          <Badge>{matches[1]}</Badge>
        </td>
      );
    }
    return <td>{value}</td>;
  }

  static readonly defaultProps = {
    showNode: true,
  };

  readonly state = { show: false };

  readonly toggle = () => {
    this.setState({ show: !this.state.show });
  };

  render(): JSX.Element {
    const event = this.props.event;
    return (
      <tr>
        {this.props.showNode && <td>{event.certname}</td>}
        <td>
          <Icon
            name={this.state.show ? 'triangle-bottom' : 'triangle-right'}
            onClick={this.toggle}
          />
          {event.resource_type}
          <wbr />[{event.resource_title}]
          <Collapse isOpen={this.state.show}>
            <div>
              <dl>
                <dt>Message:</dt>
                <dd>{event.message}</dd>
                <dt>Containing class:</dt>
                <dd>{event.containing_class}</dd>
                <dt>Containment path:</dt>
                <dd>{event.containment_path.join(' / ')}</dd>
                <dt>File:</dt>
                <dd>
                  {event.file}
                  {event.file &&
                    event.line && (
                      <span>
                        <wbr />:
                      </span>
                    )}
                  {event.line}
                </dd>
                <dt>Timestamp:</dt>
                <dd>
                  <span title={event.timestamp}>
                    <Moment format="LLL">{event.timestamp}</Moment>
                  </span>
                </dd>
                {event.report && (
                  <div>
                    <dt>Report:</dt>
                    <dd>
                      <Link to={`/report/${event.report}`}>{event.report}</Link>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </Collapse>
        </td>
        <td>
          <Badge color={EventListItem.color(this.props.event.status)}>
            {event.status.toUpperCase()}
          </Badge>
        </td>
        <td>{event.property}</td>
        {EventListItem.formatValue(event, event.old_value)}
        {EventListItem.formatValue(event, event.new_value)}
      </tr>
    );
  }
}
