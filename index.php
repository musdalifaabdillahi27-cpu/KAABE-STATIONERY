<?php
session_start();
if (isset($_SESSION['user_id'])) {
    header("Location: dashboard.php");
    exit();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Login | Stationery Management</title>
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
<body class="min-h-screen bg-[#F8F9FB] flex items-center justify-center px-4">
  <div class="w-full max-w-md">
    <div class="card-soft rounded-[32px] bg-white p-8 shadow-2xl">
      <div class="text-center mb-8">
        <div class="w-16 h-16 rounded-3xl bg-[#B80024] text-white flex items-center justify-center text-2xl font-semibold mx-auto mb-4">S</div>
        <h1 class="text-2xl font-semibold text-slate-900">Login to Stationery Management</h1>
        <p class="text-sm text-slate-500 mt-2">Enter your credentials to access the system</p>
      </div>

      <?php if (isset($_GET['error'])): ?>
        <div class="mb-4 p-3 rounded-2xl bg-rose-50 text-rose-700 text-sm">
          Invalid username or password.
        </div>
      <?php endif; ?>

      <form action="login_process.php" method="post" class="space-y-6">
        <div>
          <label for="username" class="block text-sm font-medium text-slate-700 mb-2">Username</label>
          <input type="text" id="username" name="username" placeholder="Enter your username" required class="w-full rounded-3xl border border-slate-200 px-4 py-3 focus:border-[#B80024] focus:ring-2 focus:ring-[#B80024]/20 outline-none" />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-slate-700 mb-2">Password</label>
          <input type="password" id="password" name="password" placeholder="Enter your password" required class="w-full rounded-3xl border border-slate-200 px-4 py-3 focus:border-[#B80024] focus:ring-2 focus:ring-[#B80024]/20 outline-none" />
        </div>

        <div class="flex items-center justify-between">
          <label class="flex items-center">
            <input type="checkbox" name="remember" class="rounded border-slate-300 text-[#B80024] focus:ring-[#B80024]/20" />
            <span class="ml-2 text-sm text-slate-600">Remember me</span>
          </label>
          <a href="#" class="text-sm text-[#B80024] hover:text-[#93001b]">Forgot password?</a>
        </div>

        <button type="submit" class="w-full rounded-3xl bg-[#B80024] py-3 text-white font-semibold hover:bg-[#93001b] transition">Sign In</button>
      </form>

      <div class="mt-6 text-center">
        <p class="text-sm text-slate-500">Don't have an account? <a href="#" class="text-[#B80024] hover:text-[#93001b] font-semibold">Contact Admin</a></p>
      </div>
    </div>
  </div>
</body>
</html>