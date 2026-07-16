import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import LoginPage from './pages/Login'
import ForgotPasswordPage from './pages/ForgotPassword'
import ResetPasswordPage from './pages/ResetPassword'
import ProfilePage from './pages/Profile'

import { DashboardView } from "@/components/views/dashboard-view"
import { EventsView } from "@/components/views/events-view"
import { CRMView } from "@/components/views/crm-view"
import { InventoryView } from "@/components/views/inventory-view"
import { HRView } from "@/components/views/hr-view"
import { AdminView } from "@/components/views/admin-view"
import { SalesList } from "@/components/views/sales-list"
import { CreateSale } from "@/components/views/create-sale"
import { PaymentsView } from "@/components/views/payments-view"
import { ProvidersView } from "@/components/views/providers-view"
import { Profile } from "@/components/auth/Profile"

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas de autenticación */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* Ruta principal (Layout del panel) */}
        <Route path="/" element={<Home />}>
          <Route index element={<DashboardView />} />
          <Route path="events" element={<EventsView />} />
          <Route path="crm" element={<CRMView />} />
          <Route path="inventory" element={<InventoryView />} />
          <Route path="hr" element={<HRView />} />
          <Route path="sales" element={<SalesList />} />
          <Route path="sales/create" element={<CreateSale />} />
          <Route path="payments" element={<PaymentsView />} />
          <Route path="providers" element={<ProvidersView />} />
          <Route path="admin" element={<AdminView />} />
          <Route path="my-profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
