import { Game } from '@/components/Game';
import { ProductPage } from '@/components/ProductPage';

export default function Page() {
  return <Game product={<ProductPage />} />;
}
