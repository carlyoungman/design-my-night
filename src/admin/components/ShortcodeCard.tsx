// src/admin/components/ShortcodeCard.tsx
// The [dmn_booking] shortcode: a generator, then a reference for every option.
import React from 'react';
import ShortcodeGenerator from '@admin/components/ShortcodeGenerator';

const OPTIONS: Array<{ name: string; description: React.ReactNode }> = [
  { name: 'venue_group', description: 'Overrides the default venue group set under Connection.' },
  { name: 'venue_id', description: 'Preselects a venue, by its DesignMyNight venue ID.' },
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
          Add the shortcode to any page or post to show the booking widget. Choose options below to
          preselect a venue or activities, or limit which days can be booked, then copy the result.
        </p>
      </div>

      <ShortcodeGenerator />

      <h3 id="dmn-admin-shortcode-options" className="dmn-admin__spacer-top">
        Options reference
      </h3>
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
