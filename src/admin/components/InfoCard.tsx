export default function InfoCard() {
  return (
    <section className="dmn-admin__card">
      <h2>Information</h2>
      <p>
        Use the shortcode below to embed the booking widget on any page or post. You can optionally
        pass parameters to preselect venues, activities, or limit available booking days.
      </p>
      <p><b>Shortcode options</b></p>
      <ul>
        <li style={{ marginBottom: '0.75rem' }}>
          <b>venue_group</b> – Override the default venue group set in the plugin settings. Defaults
          to the venue group configured on the Settings page if omitted.
        </li>

        <li style={{ marginBottom: '0.75rem' }}>
          <b>venue_id</b> – Preselect a specific venue. You can use "inherit" to inherit the venue
          id from the location settings
        </li>

        <li style={{ marginBottom: '0.75rem' }}>
          <b>type_id</b> – Preselect one or more activity types. Use a comma-separated list for
          multiple types.
          <br />
          <i>Note: venue_id is required when using type_id.</i>
        </li>

        <li style={{ marginBottom: '0.75rem' }}>
          <b>allow_disabled</b> – Adding allow_disabled to the shortcode will show activities that
          are marked as disabled.
        </li>

        <li style={{ marginBottom: '0.75rem' }}>
          <b>allowed_days</b> – Restrict bookings to specific days of the week. Use a
          comma-separated list (e.g. Monday,Friday,Saturday).
        </li>

        <li>
          <b>url_params</b> – Pass additional query string parameters to the booking widget (e.g.{' '})
          <code>key=value&amp;key2=value2</code><br></br> These are merged with any global URL parameters
          configured in the plugin settings.
        </li>
      </ul>
      <p><b>Example shortcode:</b></p>
      <code>[dmn_booking venue_group="" venue_id="" type_id="" allowed_days="" url_params="" allow_disabled]</code>
    </section>
  );
}
