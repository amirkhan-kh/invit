import "./_style.scss";
import Butterflies, { Butterfliess } from "../../../shared/ui-components";
import { HiOutlinePlay } from "react-icons/hi";
const Intro = () => {
  return (
    <section id="intro" className="min-h-screen sticky top-0 z-50">
      <div className="introImg">
      <div className="goldbg">
        <div className="butterfly-move">

            <Butterflies/>
        </div>
        <div className="move2">
            <Butterfliess/>
        </div>
           
        <div className="introTextCard">
          <div className="grid place-content-center">
            <img
            className="w-12 h-22 object-cover rounded-3xl"
            src="/images/optimized/duet2.avif" alt="" />
          </div>
            <span className="text-[6px] text-center text-[#d6bda5c8] font-bold">02/04/2026</span>
          <ul className="leading-5">
            <li>Farhod</li>
            <li className="vs">&</li>
            <li>Shirin</li>
          </ul>
          <div className="grid place-content-center">

          <HiOutlinePlay color="#8B7E74" size={14}/>
          </div>
        </div>
      </div>
        </div>
    </section>
  );
};

export default Intro;
