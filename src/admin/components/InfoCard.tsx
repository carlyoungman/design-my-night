export default function InfoCard() {
  return (
    <section className="dmn-admin__card" style={{ marginTop: 16 }}>
      <h2>Information</h2>
      <p>
        To display the booking widget you can use the following shortcode. You can preselect a venue
        by including a venue_id on the shortcode
      </p>
      <code>[dmn_booking]</code>
    </section>
  );
}
