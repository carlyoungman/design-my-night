export default function InfoCard() {
  return (
    <section className="dmn-admin__card">
      <h2>Information</h2>

      <p>
        Use the shortcode below to embed the booking widget on any page or post. You can optionally
        pass parameters to preselect venues, activities, or limit available booking days.
      </p>

      <p>Shortcode options</p>
      <ul>
        <li style={{ marginBottom: '0.75rem' }}>
          <b>venue_id</b> – Preselect a specific venue. You can use "inherit" to inherit the venue
          id from the location settings
        </li>

        <li style={{ marginBottom: '0.75rem' }}>
          <b>type_id</b> – Preselect one or more activity types.
          <br />
          Use a comma-separated list for multiple types.
          <br />
          <i>Note: venue_id is required when using type_id.</i>
        </li>

        <li>
          <b>allowed_days</b> – Restrict bookings to specific days of the week.
          <br />
          Use a comma-separated list (e.g. Monday,Friday,Saturday).
        </li>
      </ul>

      <p>Example shortcode:</p>
      <code>[dmn_booking venue_id="" type_id="" allowed_days=""]</code>
    </section>
  );
}
