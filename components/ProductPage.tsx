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
        <Image src={hero} alt="어두운 나무 위에 놓인 잎 달린 귤들과, 껍질을 반쯤 벗겨 과육이 보이는 귤" loading="eager" fetchPriority="high" sizes={SIZES} placeholder="blur" />
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
      </dl>
      <section className="story">
        <h2>껍질을 까는 순간,<br />달콤한 제주를 만나보세요.</h2>
        <p>귤상회는 크기별로 골라 담아 보냅니다.</p>
        <figure>
          <Image src={story} alt="수확 자루에 담긴 노지감귤" sizes={SIZES} />
          <figcaption>노지감귤 수확</figcaption>
        </figure>
      </section>
      <footer className="foot">
        <p>사진: Unsplash · Jonathan Pielmayer, insung yoon, Luis Guaman</p>
      </footer>
    </main>
  );
}
