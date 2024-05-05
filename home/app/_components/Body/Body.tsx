import Button from '@/app/_ui/Button';

const Body = () => {
  return (
    <main
      className="flex flex-wrap justify-center w-full h-auto px-5 bg-gray-200 shadow-lg rounded-tl-3xl rounded-tr-[400px] rounded-br-[200px] rounded-bl-[600px]"
    >
      <div className="flex flex-col">
        <div className="duration-200 transform rounded-t-full shadow-lg bg-yellow-50 easy-in-out">
          <article className="max-w-[1500px] w-full h-40 mx-auto max-2xl:px-10 max-2xl:rounded-full overflow-hidden rounded-xl">
            <img
              className="w-full rounded opacity-tema"
              src="https://images.unsplash.com/photo-1605379399642-870262d3d051?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80"
              alt=""
            />
          </article>
          <article className="flex justify-center px-5 -mt-12">
            <img
              className="w-40 h-40 p-2 bg-green-50 rounded-[70%_30%_30%_70%/60%_40%_60%_40%] opacity-profil"
              src='/tunahanipek.jpg'
              alt="Profil Fotoğrafı"
              width="1920"
              height="1080"
            />
          </article>
          <div className="flex flex-col">
            <header className="text-center px-14 max-sm:px-5">
              <h2 className="text-3xl font-bold text-gray-800">
                Tunahan İPEK
              </h2>
              <p className="mt-2 text-gray-400">KİŞİSEL WEB SİTESİ</p>
              <p className="mt-1 text-gray-400">
                - kurumsal olma yolunda ilk adımlar -
              </p>
              <br />
              <p className="mt-2 text-gray-600">
                Merhabalar ben Tunahan, kısaca kendimi tanıtmam gerekirse 24
                yaşındayım ve Denizli&apos;de yaşıyorum. Isparta&apos;da Biyomedikal
                bölümünden mezun oldum. Yazılım ile hobi olarak ilgileniyorken bu işi meslek olarak yapmaya karar verdim. Şu anda Rubiklabs&apos;da Software Developer olarak çalışıyorum. Aynı zamanda kendi blog sitemde yazılım ile ilgili yazılar yazıyorum. Bu siteyi kurma amacım ise bana ulaşmak isteyenlere yol göstermek ve bilgilendirmek. Sorularınız için mail adreslerimi aşağıya bırakıyorum. Benim hakkımda daha fazla bilgi almak için lüfen Blog sitemi ziyaret et..
              </p>
            </header>
            <hr className="mt-6" />
            <div
              className="flex rounded-t-full max-sm:rounded-t-none bg-gray-50 max-sm:flex-col"
            >
              <div className="w-1/2 p-4 text-center cursor-default hover:bg-gray-100 max-sm:w-full">
                <p className="flex flex-row justify-center max-md:flex-col max-sm:text-sm">
                  <span className="font-semibold mr-1">
                    KURUMSAL E-MAIL
                  </span>
                  destek@tunahanipek.com
                </p>
              </div>
              <div className="border"></div>
              <div className="w-1/2 p-4 text-center cursor-default hover:bg-gray-100 max-sm:w-full">
                <p className="flex flex-row justify-center max-md:flex-col max-sm:text-sm">
                  <span className="font-semibold mr-1">
                    KİŞİSEL E-MAIL
                  </span>
                  tnhnipek@gmail.com
                </p>
              </div>
            </div>
          </div>
        </div>
        <Button />
      </div>
    </main>
  )
};

export default Body;
