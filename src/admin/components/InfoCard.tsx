export default function InfoCard() {
  return (
    <section className="dmn-admin__card" style={{ marginTop: 16 }}>
      <h2>Information</h2>
      <p>To display the booking widget you can use the following shortcode.</p>
      <h6>Options</h6>
      <ul>
        <li>
          Preselect a venue by including a <b>venue_id</b> on the shortcode.
        </li>
        <li>
          Preselect an activity by including a <b>type_id</b> on the shortcode. A <b>venue_id</b> is
          required.
        </li>
        <li>
          Preselect days of the week by including a <b>allowed_days</b> on the shortcode. List the
          days in a comma separated list
        </li>
      </ul>
      <code>[dmn_booking venue_id="" type_id="" allowed_days=""]</code>
    </section>
  );
}
