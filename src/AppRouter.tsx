import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ScrollToTop } from "./components/ScrollToTop";
import { Link } from 'react-router-dom';
import TopNav from '@/components/TopNav';
import LockerDetail from './pages/LockerDetail';
import MarketplaceMain from './pages/MarketplaceMain';
import ProductDetail from './pages/ProductDetail';
import SnapshotPublisher from './pages/SnapshotPublisher';

import Index from "./pages/Index";
import Marketplace from "./pages/Marketplace";
import OwnerDashboard from "./pages/OwnerDashboard";
import Messages from "./pages/Messages";
import { NIP19Page } from "./pages/NIP19Page";
import NotFound from "./pages/NotFound";

export function AppRouter() {
  return (
    <BrowserRouter basename="/nostr-dead-drop-lockers">
      <ScrollToTop />
        <TopNav />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/marketplace" element={<MarketplaceMain />} />
        <Route path="/product/:dTag" element={<ProductDetail />} />
        <Route path="/snapshot" element={<SnapshotPublisher />} />
        <Route path="/dashboard" element={<OwnerDashboard />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/locker/:nip19" element={<LockerDetail />} />
        {/* NIP-19 route for npub1, note1, naddr1, nevent1, nprofile1 */}
        <Route path="/:nip19" element={<NIP19Page />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
export default AppRouter;