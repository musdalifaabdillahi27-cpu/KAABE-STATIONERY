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
    <aside class="hidden lg:block lg:w-[320px] lg:min-h-screen">
      <div class="h-full bg-[#B80024] text-white flex flex-col justify-between">
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
            <a href="landing.php" class="flex items-center gap-3 px-4 py-3 rounded-3xl hover:bg-white/10 transition">
              <span class="text-lg">🌐</span>
              <span class="font-medium">Customer Page</span>
            </a>
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
              <p class="font-semibold"><?php echo $_SESSION['username']; ?></p>
              <p class="text-sm text-white/80"><?php echo ucfirst($role); ?></p>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <main class="flex-1">
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
          <a href="landing.php" class="block px-4 py-3 rounded-2xl hover:bg-slate-100">Customer Page</a>
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
              <div class="flex gap-3">
                <button class="px-4 py-3 rounded-2xl bg-[#B80024] text-white font-semibold hover:bg-[#93001b] transition">Generate report</button>
                <button class="px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition">Filters</button>
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
  <script src="scripts/app.js"></script>
</body>
</html>