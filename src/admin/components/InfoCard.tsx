export default function InfoCard() {
  return (
    <section className="dmn-admin__card" aria-labelledby="dmn-admin-info-title">
      <h2 id="dmn-admin-info-title">Shortcode</h2>
      <p>
        Add the shortcode to any page or post to show the booking widget. Options can preselect a
        venue or activity, or limit which days can be booked.
      </p>
      <code className="dmn-admin__code-block">[dmn_booking]</code>

      <h3>Options</h3>
      <ul className="dmn-admin__list">
        <li>
          <code>venue_group</code>: overrides the default venue group from API credentials.
        </li>
        <li>
          <code>venue_id</code>: preselects a venue. Use <code>inherit</code> to take the venue ID
          from the location settings.
        </li>
        <li>
          <code>type_id</code>: preselects one or more activities (comma-separated). Needs{' '}
          <code>venue_id</code>.
        </li>
        <li>
          <code>allow_disabled</code>: also shows activities marked as disabled.
        </li>
        <li>
          <code>disable_group_limit</code>: removes the maximum group size and hides the group
          enquiry link.
        </li>
        <li>
          <code>allowed_days</code>: limits bookings to certain weekdays, e.g.{' '}
          <code>Monday,Friday,Saturday</code>.
        </li>
        <li>
          <code>url_params</code>: extra query parameters for the booking URL, e.g.{' '}
          <code>key=value&amp;key2=value2</code>. These are merged with the URL parameters set
          above.
        </li>
      </ul>

      <h3>Example</h3>
      <code className="dmn-admin__code-block">
        [dmn_booking venue_id=&quot;&quot; type_id=&quot;&quot; allowed_days=&quot;&quot;
        allow_disabled]
      </code>
    </section>
  );
}
