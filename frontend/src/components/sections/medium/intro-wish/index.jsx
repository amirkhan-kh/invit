import './_style.scss';
import Reveal from '../../../../shared/Reveal';

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
          <Reveal variant="blur">
            <div className="wishInner">
              <div className="mx-love-divider" aria-hidden><span>♥</span></div>
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
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default IntroWish;
