import './_style.scss';
import { ButterflyField, Sparkles } from '../../../../shared/ui-components';
import { parseWeddingDate } from '../../../../types/invitation.types';

const Intro = ({ data = {} }) => {
  const { husband = 'Kuyov', wife = 'Kelin', date = '', photos = [] } = data;
  const parsed = parseWeddingDate(date);
  const cover = photos && photos[0];

  return (
    <section id="intro" className="min-h-screen sticky top-0 z-10">
      <div className="introImg">
        <div className="goldbg">
          <Sparkles count={12} />
          <ButterflyField count={6} />

          <div className="introTextCard">
            <div className="grid place-content-center">
              {cover ? (
                <img
                  className="w-36 h-48 object-cover rounded-3xl shadow-lg"
                  src={cover}
                  alt=""
                />
              ) : (
                <div className="w-36 h-48 rounded-3xl grid place-content-center ringframe">
                  <span className="font-script text-4xl text-[#c9a36b]">
                    {husband?.[0]}
                    {wife?.[0]}
                  </span>
                </div>
              )}
            </div>
            <span className="dateChip">{date || '—'}</span>
            <ul className="leading-5">
              <li>{husband}</li>
              <li className="vs">&</li>
              <li>{wife}</li>
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
