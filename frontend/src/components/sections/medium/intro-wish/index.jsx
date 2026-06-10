import "./_style.scss";
const IntroWish = () => {
  return (
    <section className="introWish">
      <div >
        <div className="gifram">
          <div className="grid place-content-center h-full text-center">
            <div className="w-72 translate-y-24">
              <span className="leading-10">Hurmatli Mehmon!</span>
              <p className="px-8">
                OILA BAXTI SARI QO'YILGAN BIRINCHI QADAMDA, SIZNI FOTIHA
                TO'YIMIZGA TAKLIF QILAMIZ. SIZNING ISHTROKINGIZ BIZGA BAXT VA
                FAYZ OLIB KELADI
              </p>
              <br />
              <hr />
              <div className="flex flex-col gap-3 translate-y-4">
                <p>HURMAT BILAN</p>

                <span>Aliyevlar va Valiyevlar</span>
                <p>OILASI</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IntroWish;
