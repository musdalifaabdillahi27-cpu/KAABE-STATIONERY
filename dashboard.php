<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header("Location: index.php");
    exit();
}
$role = $_SESSION['role'];
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Admin Dashboard | Stationery Management</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="styles.css" />
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            brand: '#B80024',
            brandDark: '#93001b'
          }
        }
      }
    }
  </script>
</head>
<body class="min-h-screen bg-[#F8F9FB]">
  <div class="lg:flex">
    <aside class="hidden lg:block lg:w-[320px] lg:h-screen lg:fixed lg:inset-y-0 lg:left-0 lg:z-50">
      <div class="h-full bg-[#B80024] text-white flex flex-col justify-between overflow-y-auto">
        <div class="p-6 space-y-8">
          <div class="space-y-3">
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center text-lg font-semibold">S</div>
              <div>
                <p class="text-sm uppercase tracking-[0.2em] font-semibold">Stationery Pro</p>
                <p class="text-xs text-white/80">Admin Management</p>
              </div>
            </div>
          </div>
          <nav class="space-y-2">
            <a href="dashboard.php" class="flex items-center gap-3 px-4 py-3 rounded-3xl bg-white/15 hover:bg-white/20 transition">
              <span class="text-lg">🏠</span>
              <span class="font-medium">Dashboard</span>
            </a>
            <?php if ($role == 'admin' || $role == 'staff'): ?>
            <a href="products.php" class="flex items-center gap-3 px-4 py-3 rounded-3xl hover:bg-white/10 transition">
              <span class="text-lg">📦</span>
              <span class="font-medium">Products</span>
            </a>
            <?php endif; ?>
            <?php if ($role == 'admin'): ?>
            <a href="debts.php" class="flex items-center gap-3 px-4 py-3 rounded-3xl hover:bg-white/10 transition">
              <span class="text-lg">💳</span>
              <span class="font-medium">Debt Management</span>
            </a>
            <?php endif; ?>
            <!-- Customer Page link intentionally removed from admin nav -->
            <a href="logout.php" class="flex items-center gap-3 px-4 py-3 rounded-3xl hover:bg-white/10 transition">
              <span class="text-lg">🚪</span>
              <span class="font-medium">Logout</span>
            </a>
          </nav>
        </div>
        <div class="p-6 border-t border-white/10">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-xl font-semibold"><?php echo strtoupper(substr($_SESSION['username'], 0, 2)); ?></div>
            <div>
              <button type="button" onclick="window.location.href='logout.php'" class="inline-flex items-center justify-center rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20 transition">Logout</button>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <main class="flex-1 lg:ml-[320px]">
      <div class="lg:hidden bg-white border-b border-slate-200 px-4 py-4 flex items-center justify-between">
        <div class="text-lg font-semibold text-[#1F2937]">Stationery Pro</div>
        <button class="p-3 rounded-2xl bg-[#B80024] text-white" onclick="toggleMobileMenu('mobile-menu')">☰</button>
      </div>
      <div id="mobile-menu" class="lg:hidden hidden bg-white border-b border-slate-200 px-4 py-5">
        <nav class="space-y-2">
          <a href="dashboard.php" class="block px-4 py-3 rounded-2xl bg-[#FDE8EA] text-[#B80024]">Dashboard</a>
          <?php if ($role == 'admin' || $role == 'staff'): ?>
          <a href="products.php" class="block px-4 py-3 rounded-2xl hover:bg-slate-100">Products</a>
          <?php endif; ?>
          <?php if ($role == 'admin'): ?>
          <a href="debts.php" class="block px-4 py-3 rounded-2xl hover:bg-slate-100">Debt Management</a>
          <?php endif; ?>
          <!-- Customer Page link intentionally removed from mobile admin nav -->
          <a href="logout.php" class="block px-4 py-3 rounded-2xl hover:bg-slate-100">Logout</a>
        </nav>
      </div>

      <div class="px-4 py-5 sm:px-6 lg:px-8">
        <div class="max-w-7xl mx-auto">
          <div class="flex flex-col gap-6">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 class="text-3xl font-semibold text-slate-900">Dashboard Overview</h1>
                <p class="mt-2 text-sm text-slate-500">Welcome back, <?php echo $_SESSION['username']; ?>. Here is what is happening today.</p>
              </div>
              <div class="flex gap-3 flex-wrap">
                <button
                  onclick="generateReport()"
                  class="px-4 py-3 rounded-2xl bg-[#B80024] text-white font-semibold hover:bg-[#93001b] transition">Generate report</button>
                <button
                  onclick="generateAndDownloadReport()"
                  class="px-4 py-3 rounded-2xl border border-[#B80024] text-[#B80024] bg-white hover:bg-[#FDE8EA] transition font-semibold">Download report</button>
                <a href="landing.php" class="px-4 py-3 rounded-2xl border border-slate-200 bg-white text-[#B80024] hover:bg-[#FDE8EA] transition text-center">Back to home</a>
              </div>
            </div>

            <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div class="card-soft rounded-[28px] bg-white p-6">
                <p class="text-sm text-slate-400">Total Products</p>
                <p class="mt-4 text-3xl font-semibold">1,248</p>
                <p class="mt-3 text-sm text-emerald-600">+12% vs last month</p>
              </div>
              <div class="card-soft rounded-[28px] bg-white p-6">
                <p class="text-sm text-slate-400">Total Sales</p>
                <p class="mt-4 text-3xl font-semibold">452</p>
                <p class="mt-3 text-sm text-emerald-600">+5% vs last week</p>
              </div>
              <div class="card-soft rounded-[28px] bg-white p-6">
                <p class="text-sm text-slate-400">Total Customers</p>
                <p class="mt-4 text-3xl font-semibold">892</p>
                <p class="mt-3 text-sm text-emerald-600">+18% total growth</p>
              </div>
              <div class="card-soft rounded-[28px] bg-white p-6">
                <p class="text-sm text-slate-400">Total Revenue</p>
                <p class="mt-4 text-3xl font-semibold">$12,450</p>
                <p class="mt-3 text-sm text-emerald-600">+8% net profit increase</p>
              </div>
            </div>

            <!-- More content as before, but with PHP if needed -->
          </div>
        </div>
      </div>
    </main>
  </div>

  <!-- ===== REPORT MODAL ===== -->
  <div id="reportModal" class="fixed inset-0 hidden z-[200] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
    <div class="bg-white w-full max-w-3xl rounded-[32px] shadow-2xl overflow-hidden">

      <!-- Modal header -->
      <div class="flex items-center justify-between px-8 py-5 border-b border-slate-100 bg-slate-50">
        <h2 class="text-lg font-bold text-slate-900">Monthly Report</h2>
        <div class="flex gap-3">
          <button onclick="downloadReport()" class="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition shadow-sm">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3"/></svg>
            Download Report
          </button>
          <button onclick="printReport()" class="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#B80024] text-white text-sm font-semibold hover:bg-[#93001b] transition">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
            Print / Save PDF
          </button>
          <button onclick="closeReportModal()" class="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition text-lg">×</button>
        </div>
      </div>

      <!-- Report content (printed) -->
      <div id="reportContent" class="px-8 py-6 space-y-8">

        <!-- Invoice header -->
        <div class="flex flex-col sm:flex-row justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-[#B80024] text-white flex items-center justify-center font-bold text-lg">S</div>
            <div>
              <p class="font-bold text-slate-900 text-base">KAABE STATIO</p>
              <p class="text-xs text-slate-400">Borama, Somaliland</p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-[11px] font-bold uppercase tracking-widest text-[#B80024] mb-1">Monthly Report</p>
            <p id="reportMonthLabel" class="text-xl font-bold text-slate-900"></p>
            <p id="reportGeneratedAt" class="text-xs text-slate-400 mt-1"></p>
          </div>
        </div>

        <hr class="border-slate-100">

        <!-- Summary cards -->
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div class="rounded-2xl bg-[#FDE8EA] p-4">
            <p class="text-[11px] font-bold uppercase tracking-widest text-[#B80024] mb-1">Total Revenue</p>
            <p id="reportTotalRevenue" class="text-2xl font-bold text-slate-900">$0.00</p>
          </div>
          <div class="rounded-2xl bg-slate-50 p-4">
            <p class="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1">Products in Stock</p>
            <p id="reportProductCount" class="text-2xl font-bold text-slate-900">0</p>
          </div>
          <div class="rounded-2xl bg-slate-50 p-4">
            <p class="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1">Outstanding Debt</p>
            <p id="reportOutstandingDebt" class="text-2xl font-bold text-slate-900">$0.00</p>
          </div>
        </div>

        <!-- Products table -->
        <div>
          <h3 class="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Current Inventory</h3>
          <div class="rounded-2xl border border-slate-100 overflow-hidden">
            <table class="min-w-full text-sm text-left">
              <thead class="bg-slate-50 text-slate-500 text-[12px] uppercase tracking-wider">
                <tr>
                  <th class="px-5 py-3 font-semibold">#</th>
                  <th class="px-5 py-3 font-semibold">Product</th>
                  <th class="px-5 py-3 font-semibold">Category</th>
                  <th class="px-5 py-3 font-semibold text-right">Unit Price</th>
                  <th class="px-5 py-3 font-semibold text-right">Qty in Stock</th>
                  <th class="px-5 py-3 font-semibold text-right">Stock Value</th>
                </tr>
              </thead>
              <tbody id="reportProductsTable" class="divide-y divide-slate-100 text-slate-700">
              </tbody>
            </table>
          </div>
        </div>

        <!-- Debt summary -->
        <div>
          <h3 class="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Debt Summary</h3>
          <div id="reportDebtList" class="space-y-2"></div>
        </div>

        <!-- Footer -->
        <div class="border-t border-slate-100 pt-4 flex justify-between text-[11px] text-slate-400">
          <span>KAABE STATIO — Confidential</span>
          <span id="reportFooterDate"></span>
        </div>

      </div>
    </div>
  </div>

  <style>
    @media print {
      body > *:not(#reportModal) { display: none !important; }
      #reportModal { position: static !important; background: none !important; backdrop-filter: none !important; padding: 0 !important; display: block !important; }
      #reportModal > div { box-shadow: none !important; border-radius: 0 !important; max-width: 100% !important; }
      button { display: none !important; }
    }
  </style>

  <script src="scripts/app.js"></script>
  <script src="scripts/report.js"></script>
</body>
</html>