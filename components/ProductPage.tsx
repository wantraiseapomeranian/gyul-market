import Image from 'next/image';
import hero from '@/assets/images/hero.jpg';
import story from '@/assets/images/story.jpg';
import { Wordmark } from './Wordmark';
import { SortingTag } from './SortingTag';

const SIZES = '(max-width: 430px) 100vw, 430px';

export function ProductPage() {
  return (
    <main className="has-bar">
      <header className="mainhead"><Wordmark /></header>
      <div className="gallery">
        <Image src={hero} alt="선별대 위에 놓인 노지감귤. 초록빛이 남은 것과 노랗게 익은 것이 섞여 있다" loading="eager" fetchPriority="high" sizes={SIZES} placeholder="blur" />
        <SortingTag />
      </div>
      <section className="head" aria-label="상품 정보">
        <p className="brand-line">귤상회 선과장</p>
        <h1 className="title" id="product-title" tabIndex={-1}>제주 서귀포 햇귤 10kg</h1>
        <p className="desc">노지 온주밀감 · 2S~M 크기 혼합</p>
        <p className="price"><strong>29,900</strong><span className="won">원</span><span className="unit">100g당 299원</span></p>
      </section>
      <div className="band" />
      <dl className="info">
        <div><dt>배송</dt><dd>무료배송</dd></div>
        <div><dt>규격</dt><dd>10kg · 2S·S·M 혼합</dd></div>
        <div><dt>당도 검사</dt><dd>무료 · 10초</dd></div>
      </dl>
      <section className="story">
        <h2>껍질을 까는 순간,<br />달콤한 제주를 만나보세요.</h2>
        <p>귤상회는 크기는 규격으로, 맛은 당도 검사로 따로 확인합니다.</p>
        <figure>
          <Image src={story} alt="수확 자루에 담긴 노지감귤" sizes={SIZES} />
          <figcaption>노지감귤 수확</figcaption>
        </figure>
      </section>
      <footer className="foot">
        <p>귤상회(가칭)는 실제로 존재하지 않는 가상의 상점입니다. 이 페이지에서는 판매·결제·개인정보 수집이 이뤄지지 않습니다.</p>
        <p>사진: Unsplash · insung yoon, Luis Guaman</p>
      </footer>
    </main>
  );
}
