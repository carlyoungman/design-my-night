// src/admin/components/ShortcodeCard.tsx
// Reference for the [dmn_booking] shortcode.
import React from 'react';

const OPTIONS: Array<{ name: string; description: React.ReactNode }> = [
  { name: 'venue_group', description: 'Overrides the default venue group set under Connection.' },
  {
    name: 'venue_id',
    description: (
      <>
        Preselects a venue. Use <code>inherit</code> to take the venue ID from the location
        settings.
      </>
    ),
  },
  {
    name: 'type_id',
    description: (
      <>
        Preselects one or more activities (comma-separated). Needs <code>venue_id</code>.
      </>
    ),
  },
  { name: 'allow_disabled', description: 'Also shows activities marked as hidden.' },
  {
    name: 'disable_group_limit',
    description: 'Removes the maximum group size and hides the group enquiry link.',
  },
  {
    name: 'allowed_days',
    description: (
      <>
        Limits bookings to certain weekdays, for example <code>Monday,Friday,Saturday</code>.
      </>
    ),
  },
  {
    name: 'url_params',
    description: (
      <>
        Extra query parameters for the booking URL, for example{' '}
        <code>key=value&amp;key2=value2</code>. These are merged with the parameters set under URL
        parameters.
      </>
    ),
  },
];

export default function ShortcodeCard() {
  return (
    <section className="dmn-admin__card" aria-labelledby="dmn-admin-shortcode-title">
      <div className="dmn-admin__card-header">
        <h2 id="dmn-admin-shortcode-title">Shortcode</h2>
        <p className="dmn-admin__help">
          Add the shortcode to any page or post to show the booking widget. Options can preselect a
          venue or activity, or limit which days can be booked.
        </p>
      </div>

      <div className="dmn-admin__split">
        <div>
          <h3>Basic use</h3>
          <code className="dmn-admin__code-block">[dmn_booking]</code>
        </div>
        <div>
          <h3>Example with options</h3>
          <code className="dmn-admin__code-block">
            [dmn_booking venue_id=&quot;&quot; type_id=&quot;&quot; allowed_days=&quot;&quot;
            allow_disabled]
          </code>
        </div>
      </div>

      <h3 id="dmn-admin-shortcode-options">Options</h3>
      <div className="dmn-admin__table-wrap">
        <table className="dmn-admin__table" aria-labelledby="dmn-admin-shortcode-options">
          <thead>
            <tr>
              <th scope="col">Option</th>
              <th scope="col">What it does</th>
            </tr>
          </thead>
          <tbody>
            {OPTIONS.map((o) => (
              <tr key={o.name}>
                <th scope="row">
                  <code>{o.name}</code>
                </th>
                <td>{o.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
