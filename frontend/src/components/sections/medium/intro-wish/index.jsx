import './_style.scss';

const IntroWish = ({ data = {} }) => {
  const {
    inviteText = "Oila baxti sari qo'yilgan birinchi qadamda, sizni to'yimizga taklif qilamiz. Sizning ishtirokingiz bizga baxt va fayz olib keladi.",
    husband = '',
    wife = '',
  } = data;

  return (
    <section className="introWish">
      <div className="gifram">
        <div className="grid place-content-center h-full text-center">
          <div className="wishInner">
            <span className="hello">Hurmatli Mehmon!</span>
            <p className="body">{inviteText}</p>
            <hr />
            <div className="signoff">
              <p>HURMAT BILAN</p>
              <span className="names">
                {husband} {husband && wife ? '&' : ''} {wife}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IntroWish;
