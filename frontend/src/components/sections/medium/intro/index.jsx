import './_style.scss';
import { ButterflyField, Sparkles } from '../../../../shared/ui-components';
import { FloatingHearts } from '../../../../shared/FloatingDecor';
import { parseWeddingDate } from '../../../../types/invitation.types';
import { resolvePhotos } from '../../../../utils/photoUrl';

const Intro = ({ data = {} }) => {
  const { husband = 'Kuyov', wife = 'Kelin', date = '', photos = [] } = data;
  const parsed = parseWeddingDate(date);
  const cover = resolvePhotos(photos)[0];

  return (
    <section id="intro" className="min-h-screen sticky top-0 z-10">
      <div className="introImg">
        <div className="goldbg">
          <Sparkles count={16} />
          <FloatingHearts count={7} />
          <ButterflyField count={6} />

          <div className="introTextCard">
            <div className="grid place-content-center">
              {cover ? (
                <img
                  className="w-36 h-48 object-cover rounded-3xl shadow-lg intro-photo"
                  src={cover}
                  alt=""
                />
              ) : (
                <div className="w-36 h-48 rounded-3xl grid place-content-center ringframe">
                  <span className="font-script text-4xl text-[#c9a36b] mx-shimmer-text">
                    {husband?.[0]}
                    {wife?.[0]}
                  </span>
                </div>
              )}
            </div>
            <div className="mx-love-divider" aria-hidden><span>♥</span></div>
            <span className="dateChip">{date || '—'}</span>
            <ul className="leading-5">
              <li className="mx-shimmer-text">{husband}</li>
              <li className="vs">&</li>
              <li className="mx-shimmer-text">{wife}</li>
            </ul>
            {parsed.weekday && (
              <span className="weekday">{parsed.weekday}</span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Intro;
