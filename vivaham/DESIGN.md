# Vivaham design screens (source of truth for layout)

Each screen is a 390 px wide mobile mockup written as HTML with inline styles. Convert it to React Native: px values become dp, flex layouts stay flex layouts, colours and fonts match src/theme.ts. The HTML uses a small template dialect: `{{name}}` is a data binding, `<sc-for list="{{items}}" as="item">` repeats its children for each item, `<sc-if value="{{flag}}">` shows its children only when the flag is true (`hint-placeholder-val` shows the state drawn in the mockup), `<sc-raw-table>`, `<sc-raw-select>` and the like are ordinary table and select elements, `sc-camel-on-click` / `sc-camel-on-change` mark interactive handlers, and `href="Something.dc.html"` shows which screen a tap opens. Placeholders such as `{{dateLabel}}` or `[qty]` show where real data goes. The bottom tab bar is already built and is omitted. The dotted gold pattern in headers is optional and may be skipped.


## Screen 1.1 · Log in

```html
<div style="width: 390px; height: 844px; background: #FBF6EC; position: relative; overflow: hidden; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; color: #2A1A14; display: flex; flex-direction: column">
  <div style="height: 270px; background: radial-gradient(circle, rgba(201,154,46,0.35) 1.6px, transparent 2.2px) 0 0 / 18px 18px, #7A1F2B; border-bottom: 4px solid #C99A2E; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; color: #FFFFFF; flex: none">
    <span style="width: 72px; height: 72px; border-radius: 36px; background: #FBF6EC; border: 3px solid #C99A2E; display: flex; align-items: center; justify-content: center"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#7A1F2B" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3c2 3 3 4.5 3 6a3 3 0 0 1-6 0c0-1.5 1-3 3-6z" fill="#C99A2E" stroke="#8A6A1E"></path><path d="M4 14h16l-2.5 4h-11z"></path><path d="M9 21h6"></path></svg></span>
    <span style="font-family: 'Playfair Display', Georgia, serif; font-size: 38px; font-weight: 700">Vivaham</span>
    <span style="font-size: 15px; font-weight: 600; color: #F1DDB0">Plan every ceremony, together</span>
  </div>
  <div style="padding: 28px 20px 24px; display: flex; flex-direction: column; gap: 20px; flex: 1">
    <h1 style="margin: 0; font-size: 26px">Welcome back</h1>
    <label style="display: flex; flex-direction: column; gap: 8px; font-size: 15px; font-weight: 700">Email
      <input type="email" placeholder="you@example.com" style="height: 52px; border-radius: 12px; border: 1px solid #D9C9AC; background: #FFFFFF; padding: 0 16px; font: 500 16px 'Plus Jakarta Sans', sans-serif; color: #2A1A14">
    </label>
    <div style="display: flex; flex-direction: column; gap: 8px">
      <label for="login-password" style="font-size: 15px; font-weight: 700">Password</label>
      <div style="display: flex; align-items: center; height: 52px; border-radius: 12px; border: 1px solid #D9C9AC; background: #FFFFFF; padding: 0 4px 0 16px">
        <input id="login-password" type="password" placeholder="Your password" style="flex: 1; min-width: 0; border: none; outline: none; background: transparent; font: 500 16px 'Plus Jakarta Sans', sans-serif; color: #2A1A14">
        <button aria-label="Show password" style="width: 44px; height: 44px; border: none; background: transparent; display: flex; align-items: center; justify-content: center"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6B5A4E" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>
      </div>
      <a href="ForgotPassword.dc.html" style="align-self: flex-end; min-height: 44px; display: flex; align-items: center; font-size: 15px; font-weight: 700">Forgot password?</a>
    </div>
    <a href="Onboarding.dc.html" style="margin-top: auto; min-height: 56px; border-radius: 28px; background: #7A1F2B; color: #FFFFFF; font-size: 17px; font-weight: 700; display: flex; align-items: center; justify-content: center; text-decoration: none">Log in</a>
  </div>
</div>
```


## Screen 1.2 · Forgot password

```html
<div style="width: 390px; height: 844px; background: #FBF6EC; position: relative; overflow: hidden; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; color: #2A1A14">
  <div aria-hidden="true" style="height: 14px; background: radial-gradient(circle, #C99A2E 1.7px, transparent 2.2px) 0 0 / 14px 14px, #7A1F2B; border-bottom: 2px solid #C99A2E"></div>
  <div style="padding: 12px 20px 24px; height: 828px; box-sizing: border-box; display: flex; flex-direction: column; gap: 22px">
    <a href="Login.dc.html" style="align-self: flex-start; display: flex; align-items: center; gap: 6px; min-height: 44px; padding: 0 16px 0 10px; border-radius: 22px; background: #FFFFFF; border: 1px solid #E9DCC4; text-decoration: none; color: #2A1A14; font-size: 15px; font-weight: 700"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"></path></svg>Log in</a>
    <span style="width: 64px; height: 64px; border-radius: 32px; background: #F8ECCB; border: 2px solid #C99A2E; display: flex; align-items: center; justify-content: center"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#7A1F2B" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"></rect><path d="M8 11V8a4 4 0 0 1 8 0v3"></path></svg></span>
    <div style="display: flex; flex-direction: column; gap: 8px">
      <h1 style="margin: 0; font-size: 28px">Forgot your password?</h1>
      <p style="margin: 0; font-size: 16px; line-height: 1.5; color: #4F4036">No problem. Enter the email you signed up with and we’ll send you a link to set a new one.</p>
    </div>
    <label style="display: flex; flex-direction: column; gap: 8px; font-size: 15px; font-weight: 700">Email
      <input type="email" placeholder="you@example.com" style="height: 52px; border-radius: 12px; border: 1px solid #D9C9AC; background: #FFFFFF; padding: 0 16px; font: 500 16px 'Plus Jakarta Sans', sans-serif; color: #2A1A14">
    </label>
    <a href="ResetPassword.dc.html" style="min-height: 56px; border-radius: 28px; background: #7A1F2B; color: #FFFFFF; font-size: 17px; font-weight: 700; display: flex; align-items: center; justify-content: center; text-decoration: none">Send reset link</a>
    <span style="font-size: 15px; color: #4F4036; text-align: center">Remembered it? <a href="Login.dc.html" style="font-weight: 700">Log in</a></span>
  </div>
</div>
```


## Screen 1.3 · Set a new password

```html
<div style="width: 390px; height: 844px; background: #FBF6EC; position: relative; overflow: hidden; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; color: #2A1A14">
  <div aria-hidden="true" style="height: 14px; background: radial-gradient(circle, #C99A2E 1.7px, transparent 2.2px) 0 0 / 14px 14px, #7A1F2B; border-bottom: 2px solid #C99A2E"></div>
  <div style="padding: 12px 20px 24px; height: 828px; box-sizing: border-box; display: flex; flex-direction: column; gap: 22px">
    <a href="ForgotPassword.dc.html" style="align-self: flex-start; display: flex; align-items: center; gap: 6px; min-height: 44px; padding: 0 16px 0 10px; border-radius: 22px; background: #FFFFFF; border: 1px solid #E9DCC4; text-decoration: none; color: #2A1A14; font-size: 15px; font-weight: 700"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"></path></svg>Back</a>
    <div style="display: flex; flex-direction: column; gap: 8px">
      <h1 style="margin: 0; font-size: 28px">Set a new password</h1>
      <p style="margin: 0; font-size: 16px; line-height: 1.5; color: #4F4036">Choose something you’ll remember. You’ll use it to log in from now on.</p>
    </div>
    <div style="display: flex; flex-direction: column; gap: 8px">
      <label for="new-password" style="font-size: 15px; font-weight: 700">New password</label>
      <div style="display: flex; align-items: center; height: 52px; border-radius: 12px; border: 1px solid #D9C9AC; background: #FFFFFF; padding: 0 4px 0 16px">
        <input id="new-password" type="password" placeholder="At least 8 characters" style="flex: 1; min-width: 0; border: none; outline: none; background: transparent; font: 500 16px 'Plus Jakarta Sans', sans-serif; color: #2A1A14">
        <button aria-label="Show password" style="width: 44px; height: 44px; border: none; background: transparent; display: flex; align-items: center; justify-content: center"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6B5A4E" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>
      </div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 8px">
      <label for="confirm-password" style="font-size: 15px; font-weight: 700">Confirm new password</label>
      <div style="display: flex; align-items: center; height: 52px; border-radius: 12px; border: 1px solid #D9C9AC; background: #FFFFFF; padding: 0 4px 0 16px">
        <input id="confirm-password" type="password" placeholder="Type it again" style="flex: 1; min-width: 0; border: none; outline: none; background: transparent; font: 500 16px 'Plus Jakarta Sans', sans-serif; color: #2A1A14">
        <button aria-label="Show password" style="width: 44px; height: 44px; border: none; background: transparent; display: flex; align-items: center; justify-content: center"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6B5A4E" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>
      </div>
    </div>
    <ul style="margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 8px; font-size: 14px; color: #4F4036">
      <li style="display: flex; align-items: center; gap: 8px"><span aria-hidden="true" style="width: 18px; height: 18px; border-radius: 9px; border: 2px solid #B9A684"></span>At least 8 characters</li>
      <li style="display: flex; align-items: center; gap: 8px"><span aria-hidden="true" style="width: 18px; height: 18px; border-radius: 9px; border: 2px solid #B9A684"></span>Both passwords match</li>
    </ul>
    <a href="Login.dc.html" style="margin-top: auto; min-height: 56px; border-radius: 28px; background: #7A1F2B; color: #FFFFFF; font-size: 17px; font-weight: 700; display: flex; align-items: center; justify-content: center; text-decoration: none">Save and log in</a>
  </div>
</div>
```


## Screen 1.4 · Onboarding (2 questions)

```html
<div style="width: 390px; height: 1140px; background: #FBF6EC; position: relative; overflow: hidden; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; color: #2A1A14">
  <div aria-hidden="true" style="height: 14px; background: radial-gradient(circle, #C99A2E 1.7px, transparent 2.2px) 0 0 / 14px 14px, #7A1F2B; border-bottom: 2px solid #C99A2E"></div>
  <div style="padding: 28px 20px 24px; height: 1124px; box-sizing: border-box; display: flex; flex-direction: column; gap: 24px">
    <div style="display: flex; flex-direction: column; gap: 8px">
      <span style="font-size: 12px; font-weight: 700; color: #8A6A1E; letter-spacing: 2px">WELCOME</span>
      <h1 style="margin: 0; font-size: 28px">Let’s set up your wedding</h1>
      <p style="margin: 0; font-size: 16px; color: #4F4036">Two quick questions. You can change these later.</p>
    </div>
    <div style="display: flex; flex-direction: column; gap: 10px">
      <label for="wedding-name" style="display: flex; gap: 8px; align-items: baseline; font-size: 17px; font-weight: 700"><span style="color: #8A6A1E">1.</span>Whose wedding is this?</label>
      <input id="wedding-name" value="{{name}}" sc-camel-on-change="{{setName}}" placeholder="e.g. Akhil" style="height: 52px; border-radius: 12px; border: 1px solid #D9C9AC; background: #FFFFFF; padding: 0 16px; font: 500 16px 'Plus Jakarta Sans', sans-serif; color: #2A1A14">
      <div style="background: #7A1F2B; border: 2px solid #C99A2E; border-radius: 14px; padding: 12px 14px; display: flex; flex-direction: column; gap: 2px">
        <span style="font-size: 12px; color: #F1DDB0">Your Home screen will show</span>
        <span style="font-size: 15px; font-weight: 800; color: #FFFFFF; letter-spacing: 2px">ॐ · {{tag}} VIVAHAM</span>
      </div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 10px">
      <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 8px">
        <span style="display: flex; gap: 8px; align-items: baseline; font-size: 17px; font-weight: 700"><span style="color: #8A6A1E">2.</span>When is the wedding?</span>
        <span style="font-size: 14px; font-weight: 700; color: #7A1F2B; text-align: right">{{dateLabel}}</span>
      </div>
      <div style="background: #FFFFFF; border: 1px solid #E9DCC4; border-radius: 16px; padding: 12px; display: flex; flex-direction: column; gap: 8px">
        <div style="display: flex; align-items: center; justify-content: space-between">
          <button aria-label="Previous month" sc-camel-on-click="{{prevMonth}}" style="width: 44px; height: 44px; border-radius: 22px; border: none; background: #FBF6EC; display: flex; align-items: center; justify-content: center"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2A1A14" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"></path></svg></button>
          <span style="font-size: 16px; font-weight: 700">{{monthLabel}}</span>
          <button aria-label="Next month" sc-camel-on-click="{{nextMonth}}" style="width: 44px; height: 44px; border-radius: 22px; border: none; background: #FBF6EC; display: flex; align-items: center; justify-content: center"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2A1A14" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M9 5l7 7-7 7"></path></svg></button>
        </div>
        <div style="display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 4px; text-align: center; font-size: 12px; font-weight: 700; color: #6B5A4E">
          <span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span><span>Su</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 4px">
          <sc-for list="{{cells}}" as="c" hint-placeholder-count="35">
            <button sc-camel-on-click="{{c.pick}}" disabled="{{c.blank}}" aria-label="{{c.aria}}" style="{{c.style}}">{{c.label}}</button>
          </sc-for>
        </div>
      </div>
    </div>
    <a href="Main.dc.html" style="margin-top: auto; min-height: 56px; border-radius: 28px; background: #7A1F2B; color: #FFFFFF; font-size: 17px; font-weight: 700; display: flex; align-items: center; justify-content: center; text-decoration: none">Continue to Home</a>
  </div>
</div>
```


## Screen 1.5 · Home

```html
<div style="width: 390px; height: 844px; background: #FBF6EC; position: relative; overflow: hidden; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; color: #2A1A14">
  <div aria-hidden="true" style="height: 14px; background: radial-gradient(circle, #C99A2E 1.7px, transparent 2.2px) 0 0 / 14px 14px, #7A1F2B; border-bottom: 2px solid #C99A2E"></div>
  <div style="padding: 24px 20px 100px; display: flex; flex-direction: column; gap: 20px">
    <div style="display: flex; flex-direction: column; gap: 4px">
      <span style="font-size: 12px; font-weight: 700; color: #8A6A1E; letter-spacing: 2px">ॐ · {{tag}} VIVAHAM</span>
      <h1 style="margin: 0; font-size: 28px">{{name}}’s wedding</h1>
    </div>
    <div style="background: radial-gradient(circle, rgba(201,154,46,0.28) 1.4px, transparent 2px) 0 0 / 16px 16px, #7A1F2B; border: 2px solid #C99A2E; border-radius: 18px; padding: 18px; color: #FFFFFF; display: flex; flex-direction: column; gap: 14px">
      <div style="display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap">
        <span style="font-family: 'Playfair Display', Georgia, serif; font-size: 52px; font-weight: 700; line-height: 1">{{daysLeft}}</span>
        <span style="font-size: 17px; font-weight: 700; color: #F1DDB0">{{countCaption}}</span>
      </div>
      <div aria-hidden="true" style="height: 1px; background: #C99A2E"></div>
      <div style="display: flex; align-items: center; gap: 12px">
        <span style="width: 40px; height: 40px; border-radius: 20px; background: #FBF6EC; display: flex; align-items: center; justify-content: center; flex: none"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7A1F2B" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M3 10h18M8 3v4M16 3v4"></path></svg></span>
        <span style="display: flex; flex-direction: column; gap: 2px"><span style="font-size: 12px; font-weight: 600; color: #F1DDB0">Main wedding day</span><span style="font-size: 17px; font-weight: 800">{{weddingDateLabel}}</span></span>
      </div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 10px">
      <h2 style="margin: 0; font-size: 19px">What do you want to do?</h2>
      <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px">
        <a href="Events.dc.html" style="background: #FFFFFF; border: 1px solid #E9DCC4; border-radius: 16px; padding: 12px; min-height: 72px; box-sizing: border-box; display: flex; flex-direction: row; align-items: center; gap: 10px; text-decoration: none; color: #2A1A14">
          <span style="width: 38px; height: 38px; flex: none; border-radius: 12px; background: #F8ECCB; display: flex; align-items: center; justify-content: center"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6E5208" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M3 10h18M8 3v4M16 3v4"></path></svg></span>
          <span style="display: flex; flex-direction: column; min-width: 0"><span style="font-size: 15px; font-weight: 800">Events</span><span style="font-size: 12px; line-height: 1.3; color: #6B5A4E">2 planned</span></span>
        </a>
        <a href="Guests.dc.html" style="background: #FFFFFF; border: 1px solid #E9DCC4; border-radius: 16px; padding: 12px; min-height: 72px; box-sizing: border-box; display: flex; flex-direction: row; align-items: center; gap: 10px; text-decoration: none; color: #2A1A14">
          <span style="width: 38px; height: 38px; flex: none; border-radius: 12px; background: #E4EDE0; display: flex; align-items: center; justify-content: center"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2F5D3A" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="9" cy="8" r="3.5"></circle><path d="M2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5"></path><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.8c1.8.7 3 2.5 3.5 5.2"></path></svg></span>
          <span style="display: flex; flex-direction: column; min-width: 0"><span style="font-size: 15px; font-weight: 800">Guests</span><span style="font-size: 12px; line-height: 1.3; color: #6B5A4E">1 invited</span></span>
        </a>
        <a href="Shopping.dc.html" style="background: #FFFFFF; border: 1px solid #E9DCC4; border-radius: 16px; padding: 12px; min-height: 72px; box-sizing: border-box; display: flex; flex-direction: row; align-items: center; gap: 10px; text-decoration: none; color: #2A1A14">
          <span style="width: 38px; height: 38px; flex: none; border-radius: 12px; background: #F7E4E1; display: flex; align-items: center; justify-content: center"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7A1F2B" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 8h14l-1 12H6z"></path><path d="M9 8V6a3 3 0 0 1 6 0v2"></path></svg></span>
          <span style="display: flex; flex-direction: column; min-width: 0"><span style="font-size: 15px; font-weight: 800">Shopping</span><span style="font-size: 12px; line-height: 1.3; color: #6B5A4E">2 to buy</span></span>
        </a>
        <a href="Requirements.dc.html" style="background: #FFFFFF; border: 1px solid #E9DCC4; border-radius: 16px; padding: 12px; min-height: 72px; box-sizing: border-box; display: flex; flex-direction: row; align-items: center; gap: 10px; text-decoration: none; color: #2A1A14">
          <span style="width: 38px; height: 38px; flex: none; border-radius: 12px; background: #F8ECCB; display: flex; align-items: center; justify-content: center"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6E5208" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3c2 3 3 4.5 3 6a3 3 0 0 1-6 0c0-1.5 1-3 3-6z"></path><path d="M4 14h16l-2.5 4h-11z"></path><path d="M9 21h6"></path></svg></span>
          <span style="display: flex; flex-direction: column; min-width: 0"><span style="font-size: 15px; font-weight: 800">Requirements</span><span style="font-size: 12px; line-height: 1.3; color: #6B5A4E">Flowers, pooja</span></span>
        </a>
        <a href="Budget.dc.html" style="background: #FFFFFF; border: 1px solid #E9DCC4; border-radius: 16px; padding: 12px; min-height: 72px; box-sizing: border-box; display: flex; flex-direction: row; align-items: center; gap: 10px; text-decoration: none; color: #2A1A14">
          <span style="width: 38px; height: 38px; flex: none; border-radius: 12px; background: #E4EDE0; display: flex; align-items: center; justify-content: center"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2F5D3A" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><rect x="3" y="6" width="18" height="14" rx="2"></rect><path d="M3 10h18M16 15h2"></path></svg></span>
          <span style="display: flex; flex-direction: column; min-width: 0"><span style="font-size: 15px; font-weight: 800">Budget</span><span style="font-size: 12px; line-height: 1.3; color: #6B5A4E">₹15,000 committed</span></span>
        </a>
        <a href="Food.dc.html" style="background: #FFFFFF; border: 1px solid #E9DCC4; border-radius: 16px; padding: 12px; min-height: 72px; box-sizing: border-box; display: flex; flex-direction: row; align-items: center; gap: 10px; text-decoration: none; color: #2A1A14">
          <span style="width: 38px; height: 38px; flex: none; border-radius: 12px; background: #F7E4E1; display: flex; align-items: center; justify-content: center"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7A1F2B" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12h18a9 9 0 0 1-18 0z"></path><path d="M8 8c0-2 2-2 2-4M13 8c0-2 2-2 2-4"></path></svg></span>
          <span style="display: flex; flex-direction: column; min-width: 0"><span style="font-size: 15px; font-weight: 800">Food</span><span style="font-size: 12px; line-height: 1.3; color: #6B5A4E">1 meal planned</span></span>
        </a>
        <a href="Stays.dc.html" style="background: #FFFFFF; border: 1px solid #E9DCC4; border-radius: 16px; padding: 12px; min-height: 72px; box-sizing: border-box; display: flex; flex-direction: row; align-items: center; gap: 10px; text-decoration: none; color: #2A1A14">
          <span style="width: 38px; height: 38px; flex: none; border-radius: 12px; background: #E4EDE0; display: flex; align-items: center; justify-content: center"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2F5D3A" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 21V8l9-5 9 5v13"></path><path d="M9 21v-6h6v6"></path><path d="M3 21h18"></path></svg></span>
          <span style="display: flex; flex-direction: column; min-width: 0"><span style="font-size: 15px; font-weight: 800">Stays</span><span style="font-size: 12px; line-height: 1.3; color: #6B5A4E">7 rooms · 2 places</span></span>
        </a>
        <a href="Tasks.dc.html" style="background: #FFFFFF; border: 1px solid #E9DCC4; border-radius: 16px; padding: 12px; min-height: 72px; box-sizing: border-box; display: flex; flex-direction: row; align-items: center; gap: 10px; text-decoration: none; color: #2A1A14">
          <span style="width: 38px; height: 38px; flex: none; border-radius: 12px; background: #F1E7D6; display: flex; align-items: center; justify-content: center"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4F4036" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3"></rect><path d="M8 12l3 3 5-6"></path></svg></span>
          <span style="display: flex; flex-direction: column; min-width: 0"><span style="font-size: 15px; font-weight: 800">To-do</span><span style="font-size: 12px; line-height: 1.3; color: #6B5A4E">3 tasks left</span></span>
        </a>
      </div>
    </div>
  </div>
  <!-- bottom tab bar: built already -->
</div>
```


## Screen 2.1 · Events

```html
<div style="width: 390px; height: 844px; background: #FBF6EC; position: relative; overflow: hidden; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; color: #2A1A14">
  <div aria-hidden="true" style="height: 14px; background: radial-gradient(circle, #C99A2E 1.7px, transparent 2.2px) 0 0 / 14px 14px, #7A1F2B; border-bottom: 2px solid #C99A2E"></div>
  <div style="padding: 12px 20px 100px; display: flex; flex-direction: column; gap: 18px">
    <a href="Main.dc.html" style="align-self: flex-start; display: flex; align-items: center; gap: 6px; min-height: 44px; padding: 0 16px 0 10px; border-radius: 22px; background: #FFFFFF; border: 1px solid #E9DCC4; text-decoration: none; color: #2A1A14; font-size: 15px; font-weight: 700"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"></path></svg>Home</a>
    <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px">Events</h1>
    <div style="display: flex; flex-direction: column; gap: 12px">
      <a href="EventDetail.dc.html" style="background: #FFFFFF; border: 1px solid #E9DCC4; border-radius: 16px; padding: 16px; display: flex; align-items: center; gap: 14px; text-decoration: none; color: #2A1A14">
        <span style="width: 56px; height: 60px; border-radius: 14px; background: #F8ECCB; color: #6E5208; display: flex; flex-direction: column; align-items: center; justify-content: center"><span style="font-size: 12px; font-weight: 700">APR</span><span style="font-size: 22px; font-weight: 800; line-height: 1.1">22</span></span>
        <span style="flex: 1; display: flex; flex-direction: column; gap: 4px"><span style="font-size: 18px; font-weight: 700">Mehandi</span><span style="font-size: 14px; color: #6B5A4E">Thu · 12:00 · 20 guests</span></span>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6B5A4E" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M9 5l7 7-7 7"></path></svg>
      </a>
      <a href="EventDetail.dc.html" style="background: #FFFFFF; border: 1px solid #E9DCC4; border-radius: 16px; padding: 16px; display: flex; align-items: center; gap: 14px; text-decoration: none; color: #2A1A14">
        <span style="width: 56px; height: 60px; border-radius: 14px; background: #F8ECCB; color: #6E5208; display: flex; flex-direction: column; align-items: center; justify-content: center"><span style="font-size: 12px; font-weight: 700">APR</span><span style="font-size: 22px; font-weight: 800; line-height: 1.1">26</span></span>
        <span style="flex: 1; display: flex; flex-direction: column; gap: 4px"><span style="font-size: 18px; font-weight: 700">Haldi</span><span style="font-size: 14px; color: #6B5A4E">Mon · 10:00 · 70 guests</span></span>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6B5A4E" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M9 5l7 7-7 7"></path></svg>
      </a>
    </div>
    <a href="AddEvent.dc.html" style="min-height: 52px; border-radius: 26px; background: #7A1F2B; color: #FFFFFF; font-size: 16px; font-weight: 700; display: flex; align-items: center; justify-content: center; text-decoration: none">+ Add an event</a>
  </div>
  <!-- bottom tab bar: built already -->
</div>
```


## Screen 2.2 · Add an event

```html
<div style="width: 390px; height: 2460px; background: #FBF6EC; position: relative; overflow: hidden; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; color: #2A1A14">
  <div aria-hidden="true" style="height: 14px; background: radial-gradient(circle, #C99A2E 1.7px, transparent 2.2px) 0 0 / 14px 14px, #7A1F2B; border-bottom: 2px solid #C99A2E"></div>
  <div style="padding: 12px 20px 24px; height: 2444px; box-sizing: border-box; display: flex; flex-direction: column; gap: 22px">
    <a href="Events.dc.html" style="align-self: flex-start; display: flex; align-items: center; gap: 6px; min-height: 44px; padding: 0 16px 0 10px; border-radius: 22px; background: #FFFFFF; border: 1px solid #E9DCC4; text-decoration: none; color: #2A1A14; font-size: 15px; font-weight: 700"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"></path></svg>Cancel</a>
    <h1 style="margin: 0; font-size: 28px">Add an event</h1>
    <div style="display: flex; flex-direction: column; gap: 10px">
      <span style="font-size: 15px; font-weight: 700">Which event?</span>
      <div style="display: flex; flex-wrap: wrap; gap: 8px">
        <sc-for list="{{evChips}}" as="ec" hint-placeholder-count="5">
          <span style="{{ec.wrapStyle}}">
            <button sc-camel-on-click="{{ec.pick}}" aria-pressed="{{ec.pressed}}" style="{{ec.style}}">{{ec.label}}</button>
            <button sc-camel-on-click="{{ec.remove}}" aria-label="{{ec.removeAria}}" style="{{ec.xStyle}}">×</button>
          </span>
        </sc-for>
      </div>
      <div style="display: flex; gap: 8px">
        <input aria-label="Add your own event" value="{{evDraft}}" sc-camel-on-change="{{setEvDraft}}" placeholder="Add your own, e.g. Nalugu" style="flex: 1; min-width: 0; height: 48px; border-radius: 12px; border: 1px solid #D9C9AC; background: #FFFFFF; padding: 0 14px; font: 500 15px 'Plus Jakarta Sans', sans-serif; color: #2A1A14">
        <button sc-camel-on-click="{{addEv}}" style="height: 48px; padding: 0 16px; border-radius: 12px; border: 1.5px solid #7A1F2B; background: #FFFFFF; font: 700 15px 'Plus Jakarta Sans', sans-serif; color: #7A1F2B; cursor: pointer">+ Add</button>
      </div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 8px">
      <div style="display: flex; justify-content: space-between; align-items: baseline">
        <span style="font-size: 15px; font-weight: 700">Date</span>
        <span style="font-size: 15px; font-weight: 700; color: #7A1F2B">{{dateLabel}}</span>
      </div>
      <div style="background: #FFFFFF; border: 1px solid #E9DCC4; border-radius: 16px; padding: 12px; display: flex; flex-direction: column; gap: 8px">
        <div style="display: flex; align-items: center; justify-content: space-between">
          <button aria-label="Previous month" sc-camel-on-click="{{prevMonth}}" style="width: 44px; height: 44px; border-radius: 22px; border: none; background: #FBF6EC; display: flex; align-items: center; justify-content: center"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2A1A14" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"></path></svg></button>
          <span style="font-size: 16px; font-weight: 700">{{monthLabel}}</span>
          <button aria-label="Next month" sc-camel-on-click="{{nextMonth}}" style="width: 44px; height: 44px; border-radius: 22px; border: none; background: #FBF6EC; display: flex; align-items: center; justify-content: center"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2A1A14" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M9 5l7 7-7 7"></path></svg></button>
        </div>
        <div style="display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 4px; text-align: center; font-size: 12px; font-weight: 700; color: #6B5A4E">
          <span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span><span>Su</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 4px">
          <sc-for list="{{cells}}" as="c" hint-placeholder-count="35">
            <button sc-camel-on-click="{{c.pick}}" disabled="{{c.blank}}" aria-label="{{c.aria}}" style="{{c.style}}">{{c.label}}</button>
          </sc-for>
        </div>
      </div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 8px">
      <div style="display: flex; justify-content: space-between; align-items: baseline">
        <span style="font-size: 15px; font-weight: 700">Start time</span>
        <span style="font-size: 15px; font-weight: 700; color: #7A1F2B">{{timeLabel}}</span>
      </div>
      <div style="background: #FFFFFF; border: 1px solid #E9DCC4; border-radius: 16px; padding: 12px; display: flex; flex-direction: column; gap: 12px">
        <div style="display: flex; align-items: center; gap: 10px">
          <span style="font-size: 14px; font-weight: 600; color: #4F4036; width: 52px">Hour</span>
          <div style="flex: 1; display: flex; align-items: center; justify-content: space-between; border-radius: 12px; border: 1px solid #D9C9AC">
            <button aria-label="Earlier hour" sc-camel-on-click="{{hourDown}}" style="width: 48px; height: 48px; border: none; background: transparent; font: 700 22px 'Plus Jakarta Sans', sans-serif; color: #2A1A14">−</button>
            <span style="font-size: 20px; font-weight: 800">{{hour}}</span>
            <button aria-label="Later hour" sc-camel-on-click="{{hourUp}}" style="width: 48px; height: 48px; border: none; background: transparent; font: 700 22px 'Plus Jakarta Sans', sans-serif; color: #2A1A14">+</button>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 10px">
          <span style="font-size: 14px; font-weight: 600; color: #4F4036; width: 52px">Minute</span>
          <div style="flex: 1; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px">
            <sc-for list="{{mins}}" as="mn" hint-placeholder-count="4">
              <button sc-camel-on-click="{{mn.pick}}" style="{{mn.style}}">{{mn.label}}</button>
            </sc-for>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px">
          <button sc-camel-on-click="{{pickAm}}" style="{{amStyle}}">Morning (AM)</button>
          <button sc-camel-on-click="{{pickPm}}" style="{{pmStyle}}">Afternoon / Evening (PM)</button>
        </div>
      </div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 8px">
      <span style="font-size: 15px; font-weight: 700">Dress code for this event?</span>
      <div role="radiogroup" aria-label="Dress code" style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px">
        <button role="radio" aria-checked="{{dressYesStr}}" sc-camel-on-click="{{dressYes}}" style="{{dressYesStyle}}">Yes</button>
        <button role="radio" aria-checked="{{dressNoStr}}" sc-camel-on-click="{{dressNo}}" style="{{dressNoStyle}}">No</button>
      </div>
      <sc-if value="{{hasDress}}" hint-placeholder-val="{{ false }}">
        <input aria-label="Describe the dress code" placeholder="e.g. Yellow traditional, silk sarees and veshti" style="height: 52px; border-radius: 12px; border: 1px solid #D9C9AC; background: #FFFFFF; padding: 0 16px; font: 500 16px 'Plus Jakarta Sans', sans-serif; color: #2A1A14">
      </sc-if>
    </div>
    <div style="display: flex; align-items: center; justify-content: space-between">
      <span style="display: flex; flex-direction: column; gap: 2px"><span style="font-size: 15px; font-weight: 700">Expected guests</span><span style="font-size: 13px; color: #6B5A4E">A rough number is fine</span></span>
      <div style="display: flex; align-items: center; gap: 4px; border-radius: 12px; border: 1px solid #D9C9AC; background: #FFFFFF">
        <button aria-label="Fewer guests" sc-camel-on-click="{{guestsDown}}" style="width: 48px; height: 48px; border: none; background: transparent; font: 700 22px 'Plus Jakarta Sans', sans-serif; color: #2A1A14">−</button>
        <span style="width: 44px; text-align: center; font-size: 18px; font-weight: 700">{{guests}}</span>
        <button aria-label="More guests" sc-camel-on-click="{{guestsUp}}" style="width: 48px; height: 48px; border: none; background: transparent; font: 700 22px 'Plus Jakarta Sans', sans-serif; color: #2A1A14">+</button>
      </div>
    </div>
    <div style="display: flex; align-items: center; gap: 10px; font-size: 12px; font-weight: 800; letter-spacing: 1.5px; color: #8A6A1E"><span>VENDORS</span><span aria-hidden="true" style="flex: 1; height: 1px; background: #E2CF9F"></span></div>
    <div style="display: flex; flex-direction: column; gap: 10px">
      <span style="display: flex; justify-content: space-between; align-items: baseline"><span style="font-size: 15px; font-weight: 700">Vendors for this event</span><span style="font-size: 13px; color: #6B5A4E">{{vendorCount}}</span></span>
      <sc-if value="{{noVendors}}" hint-placeholder-val="{{ false }}">
        <div style="border: 2px dashed #D9C9AC; border-radius: 14px; padding: 14px; font-size: 14px; color: #6B5A4E; text-align: center">No vendors yet. Add the decorator, caterer, priest or photographer below.</div>
      </sc-if>
      <sc-for list="{{vendors}}" as="vd" hint-placeholder-count="1">
        <div style="background: #FFFFFF; border: 1px solid #E9DCC4; border-radius: 14px; padding: 12px; display: flex; align-items: center; gap: 12px; margin-bottom: 8px">
          <span style="width: 40px; height: 40px; border-radius: 20px; background: #F8ECCB; color: #6E5208; display: flex; align-items: center; justify-content: center; font-weight: 800; flex: none">{{vd.initial}}</span>
          <span style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px"><span style="font-size: 15px; font-weight: 800">{{vd.name}}</span><span style="font-size: 13px; color: #6B5A4E">{{vd.service}}</span><a href="{{vd.tel}}" style="font-size: 14px; font-weight: 700">{{vd.phone}}</a></span>
          <button sc-camel-on-click="{{vd.remove}}" aria-label="{{vd.removeAria}}" style="width: 40px; height: 40px; border-radius: 10px; border: 1px solid #E9DCC4; background: #FFFFFF; display: flex; align-items: center; justify-content: center; flex: none; cursor: pointer"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#7A1F2B" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"></path><path d="M10 11v6M14 11v6"></path></svg></button>
        </div>
      </sc-for>
      <div style="background: #FFFFFF; border: 1px solid #E9DCC4; border-radius: 14px; padding: 12px; display: flex; flex-direction: column; gap: 8px">
        <span style="font-size: 14px; font-weight: 700">Add a vendor</span>
        <input aria-label="Vendor name" value="{{vName}}" sc-camel-on-change="{{setVName}}" placeholder="Vendor or shop name" style="height: 48px; border-radius: 12px; border: 1px solid #D9C9AC; background: #FFFFFF; padding: 0 14px; font: 500 15px 'Plus Jakarta Sans', sans-serif; color: #2A1A14">
        <input aria-label="What they do" value="{{vService}}" sc-camel-on-change="{{setVService}}" placeholder="What they do, e.g. Decorator, Caterer" style="height: 48px; border-radius: 12px; border: 1px solid #D9C9AC; background: #FFFFFF; padding: 0 14px; font: 500 15px 'Plus Jakarta Sans', sans-serif; color: #2A1A14">
        <input type="tel" inputmode="tel" aria-label="Contact number" value="{{vPhone}}" sc-camel-on-change="{{setVPhone}}" placeholder="Contact number, e.g. +91 98765 43210" style="height: 48px; border-radius: 12px; border: 1px solid #D9C9AC; background: #FFFFFF; padding: 0 14px; font: 500 15px 'Plus Jakarta Sans', sans-serif; color: #2A1A14">
        <button sc-camel-on-click="{{addVendor}}" style="height: 48px; padding: 0 16px; border-radius: 12px; border: 1.5px solid #7A1F2B; background: #FFFFFF; font: 700 15px 'Plus Jakarta Sans', sans-serif; color: #7A1F2B; cursor: pointer">+ Add vendor</button>
      </div>
    </div>
    <div style="display: flex; align-items: center; gap: 10px; font-size: 12px; font-weight: 800; letter-spacing: 1.5px; color: #8A6A1E"><span>DECORATION</span><span aria-hidden="true" style="flex: 1; height: 1px; background: #E2CF9F"></span></div>
    <div style="display: flex; flex-direction: column; gap: 10px">
      <span style="font-size: 15px; font-weight: 700">Decor items</span>
      <div style="display: flex; flex-wrap: wrap; gap: 6px">
        <sc-for list="{{decor}}" as="dc" hint-placeholder-count="2">
          <span style="display: inline-flex; align-items: center; padding: 0 2px 0 12px; border-radius: 999px; background: #F7E4E1; border: 1px solid #E8C4BE; color: #7A1F2B; font-size: 14px; font-weight: 700">{{dc.label}}<button sc-camel-on-click="{{dc.remove}}" aria-label="{{dc.aria}}" style="width: 36px; height: 36px; border: none; background: transparent; font: 600 18px 'Plus Jakarta Sans', sans-serif; color: #7A1F2B; cursor: pointer">×</button></span>
        </sc-for>
      </div>
      <sc-if value="{{hasSuggest}}" hint-placeholder-val="{{ true }}">
        <span style="font-size: 13px; color: #6B5A4E">Tap to add:</span>
        <div style="display: flex; flex-wrap: wrap; gap: 6px">
          <sc-for list="{{suggest}}" as="sg" hint-placeholder-count="4">
            <button sc-camel-on-click="{{sg.add}}" style="min-height: 38px; padding: 0 12px; border-radius: 999px; border: 1px dashed #B9A684; background: #FFFFFF; font: 600 13px 'Plus Jakarta Sans', sans-serif; color: #4F4036; cursor: pointer">+ {{sg.label}}</button>
          </sc-for>
        </div>
      </sc-if>
      <div style="display: flex; gap: 8px">
        <input aria-label="Add a decor item" value="{{decorDraft}}" sc-camel-on-change="{{setDecorDraft}}" placeholder="Add your own decor item" style="flex: 1; min-width: 0; height: 48px; border-radius: 12px; border: 1px solid #D9C9AC; background: #FFFFFF; padding: 0 14px; font: 500 15px 'Plus Jakarta Sans', sans-serif; color: #2A1A14">
        <button sc-camel-on-click="{{addDecor}}" style="height: 48px; padding: 0 16px; border-radius: 12px; border: 1.5px solid #7A1F2B; background: #FFFFFF; font: 700 15px 'Plus Jakarta Sans', sans-serif; color: #7A1F2B; cursor: pointer">+ Add</button>
      </div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 10px">
      <span style="display: flex; justify-content: space-between; align-items: baseline"><span style="font-size: 15px; font-weight: 700">Decoration photos</span><span style="font-size: 13px; color: #6B5A4E">{{photoCount}}</span></span>
      <span style="font-size: 13px; color: #6B5A4E">Add ideas or photos from the decorator so everyone knows the look.</span>
      <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px">
        <button sc-camel-on-click="{{addPhoto}}" style="aspect-ratio: 1; border-radius: 14px; border: 2px dashed #B9A684; background: #FFFFFF; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; font: 700 13px 'Plus Jakarta Sans', sans-serif; color: #7A1F2B; cursor: pointer"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#7A1F2B" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z"></path><circle cx="12" cy="13" r="3.5"></circle></svg>Add photo</button>
        <sc-for list="{{photos}}" as="ph" hint-placeholder-count="2">
          <div style="position: relative; aspect-ratio: 1; border-radius: 14px; overflow: hidden; background: radial-gradient(circle, rgba(201,154,46,0.45) 1.5px, transparent 2px) 0 0 / 12px 12px, {{ph.bg}}; display: flex; align-items: flex-end; padding: 8px; box-sizing: border-box">
            <span style="font-size: 12px; font-weight: 700; color: #FFFFFF; background: rgba(42,26,20,0.55); padding: 2px 8px; border-radius: 999px">{{ph.label}}</span>
            <button sc-camel-on-click="{{ph.remove}}" aria-label="{{ph.aria}}" style="position: absolute; top: 4px; right: 4px; width: 32px; height: 32px; border-radius: 16px; border: none; background: rgba(255,255,255,0.92); font: 700 16px 'Plus Jakarta Sans', sans-serif; color: #7A1F2B; cursor: pointer">×</button>
          </div>
        </sc-for>
      </div>
    </div>
    <a href="Events.dc.html" style="margin-top: auto; min-height: 56px; border-radius: 28px; background: #7A1F2B; color: #FFFFFF; font-size: 17px; font-weight: 700; display: flex; align-items: center; justify-content: center; text-decoration: none">Save event</a>
  </div>
</div>
```


## Screen 2.3 · One event (Haldi)

```html
<div style="width: 390px; height: 844px; background: #FBF6EC; position: relative; overflow: hidden; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; color: #2A1A14">
  <div aria-hidden="true" style="height: 14px; background: radial-gradient(circle, #C99A2E 1.7px, transparent 2.2px) 0 0 / 14px 14px, #7A1F2B; border-bottom: 2px solid #C99A2E"></div>
  <div style="padding: 16px 20px 100px; display: flex; flex-direction: column; gap: 20px">
    <a href="Events.dc.html" style="align-self: flex-start; display: flex; align-items: center; gap: 6px; min-height: 44px; padding: 0 16px 0 10px; border-radius: 22px; background: #FFFFFF; border: 1px solid #E9DCC4; text-decoration: none; color: #2A1A14; font-size: 15px; font-weight: 700"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"></path></svg>All events</a>
    <div style="display: flex; flex-direction: column; gap: 6px">
      <h1 style="margin: 0; font-size: 32px; font-weight: 800; letter-spacing: -0.5px">Haldi</h1>
      <span style="font-size: 16px; color: #4F4036">Mon 26 Apr 2027 · 10:00</span>
      <span style="font-size: 16px; color: #4F4036">[Venue]</span>
    </div>
    <div style="background: #FFFFFF; border: 1px solid #E9DCC4; border-radius: 16px; display: flex; flex-direction: column">
      <div style="padding: 16px; display: flex; flex-direction: column; gap: 6px; border-bottom: 1px solid #F1E7D6">
        <span style="font-size: 17px; font-weight: 700">Schedule</span>
        <span style="font-size: 14px; color: #6B5A4E">Nothing planned yet.</span>
        <button style="align-self: flex-start; min-height: 44px; padding: 0; border: none; background: transparent; font: 700 15px 'Plus Jakarta Sans', sans-serif; color: #7A1F2B">+ Add a time</button>
      </div>
      <a href="Guests.dc.html" style="padding: 16px; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid #F1E7D6; text-decoration: none; color: #2A1A14">
        <span style="flex: 1; display: flex; flex-direction: column; gap: 4px"><span style="font-size: 17px; font-weight: 700">Guests</span><span style="font-size: 14px; color: #6B5A4E">70 expected · 0 confirmed</span></span>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6B5A4E" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M9 5l7 7-7 7"></path></svg>
      </a>
      <a href="Requirements.dc.html" style="padding: 16px; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid #F1E7D6; text-decoration: none; color: #2A1A14">
        <span style="flex: 1; display: flex; flex-direction: column; gap: 4px"><span style="font-size: 17px; font-weight: 700">Requirements</span><span style="font-size: 14px; color: #6B5A4E">Flowers, pooja items · 2 still needed</span></span>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6B5A4E" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M9 5l7 7-7 7"></path></svg>
      </a>
      <a href="Shopping.dc.html" style="padding: 16px; display: flex; align-items: center; gap: 12px; text-decoration: none; color: #2A1A14">
        <span style="flex: 1; display: flex; flex-direction: column; gap: 4px"><span style="font-size: 17px; font-weight: 700">Shopping</span><span style="font-size: 14px; color: #6B5A4E">2 items · ₹15,000</span></span>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6B5A4E" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M9 5l7 7-7 7"></path></svg>
      </a>
    </div>
    <a href="EditEvent.dc.html" style="min-height: 48px; border-radius: 24px; border: 1.5px solid #D9C9AC; background: #FFFFFF; font-size: 15px; font-weight: 700; color: #2A1A14; display: flex; align-items: center; justify-content: center; text-decoration: none">Edit event</a>
  </div>
  <!-- bottom tab bar: built already -->
</div>
```


## Screen 2.4 · Requirements

```html
<div style="width: 390px; height: 940px; background: #FBF6EC; position: relative; overflow: hidden; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; color: #2A1A14">
  <div aria-hidden="true" style="height: 14px; background: radial-gradient(circle, #C99A2E 1.7px, transparent 2.2px) 0 0 / 14px 14px, #7A1F2B; border-bottom: 2px solid #C99A2E"></div>
  <div style="padding: 12px 20px 100px; display: flex; flex-direction: column; gap: 16px">
    <a href="Main.dc.html" style="align-self: flex-start; display: flex; align-items: center; gap: 6px; min-height: 44px; padding: 0 16px 0 10px; border-radius: 22px; background: #FFFFFF; border: 1px solid #E9DCC4; text-decoration: none; color: #2A1A14; font-size: 15px; font-weight: 700"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"></path></svg>Home</a>
    <div style="display: flex; flex-direction: column; gap: 4px">
      <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px">Requirements</h1>
      <span style="font-size: 14px; color: #6B5A4E">Flowers, pooja items and decor each event needs, and who is arranging them.</span>
    </div>
    <div role="tablist" style="display: flex; background: #F1E7D6; border-radius: 12px; padding: 4px; gap: 4px">
      <button role="tab" aria-selected="{{byEventSel}}" sc-camel-on-click="{{showByEvent}}" style="{{byEventTab}}">By event</button>
      <button role="tab" aria-selected="{{buyOnceSel}}" sc-camel-on-click="{{showBuyOnce}}" style="{{buyOnceTab}}">Buy once, use many</button>
    </div>
    <sc-if value="{{byEvent}}" hint-placeholder-val="{{ true }}">
    <div style="display: flex; flex-direction: column; gap: 16px">
    <button style="min-height: 48px; border-radius: 12px; border: 1px solid #D9C9AC; background: #FFFFFF; padding: 0 16px; display: flex; align-items: center; justify-content: space-between; font: 600 16px 'Plus Jakarta Sans', sans-serif; color: #2A1A14">Haldi · 26 Apr<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 9l6 6 6-6"></path></svg></button>
    <span style="font-size: 15px; color: #4F4036"><b style="color: #2A1A14">1</b> arranged · <b style="color: #9C2B3F">3</b> still needed</span>
    <div style="display: flex; flex-direction: column; gap: 8px">
      <span style="font-size: 12px; font-weight: 700; color: #6B5A4E; letter-spacing: 0.8px">FLOWERS</span>
      <div style="background: #FFFFFF; border: 1px solid #E9DCC4; border-radius: 16px; display: flex; flex-direction: column">
        <div style="display: flex; align-items: center; gap: 12px; padding: 14px 16px; min-height: 60px; border-bottom: 1px solid #F1E7D6">
          <span style="flex: 1; display: flex; flex-direction: column; gap: 2px"><span style="font-size: 16px; font-weight: 600">Roses</span><span style="font-size: 13px; color: #6B5A4E">100 pieces · Anand</span></span>
          <button style="min-height: 36px; padding: 0 12px; border-radius: 999px; border: none; background: #F7E4E1; color: #7A1F2B; font: 700 13px 'Plus Jakarta Sans', sans-serif">Needed</button>
        </div>
        <div style="display: flex; align-items: center; gap: 12px; padding: 14px 16px; min-height: 60px; border-bottom: 1px solid #F1E7D6">
          <span style="flex: 1; display: flex; flex-direction: column; gap: 2px"><span style="font-size: 16px; font-weight: 600">Marigold garlands</span><span style="font-size: 13px; color: #6B5A4E">[qty] kg · Anand</span></span>
          <button style="min-height: 36px; padding: 0 12px; border-radius: 999px; border: none; background: #F7E4E1; color: #7A1F2B; font: 700 13px 'Plus Jakarta Sans', sans-serif">Needed</button>
        </div>
        <div style="display: flex; align-items: center; gap: 12px; padding: 14px 16px; min-height: 60px">
          <span style="flex: 1; display: flex; flex-direction: column; gap: 2px"><span style="font-size: 16px; font-weight: 600">Jasmine strings</span><span style="font-size: 13px; color: #6B5A4E">[qty] pieces · Soundarya</span></span>
          <button style="min-height: 36px; padding: 0 12px; border-radius: 999px; border: none; background: #E4EDE0; color: #2F5D3A; font: 700 13px 'Plus Jakarta Sans', sans-serif">Arranged</button>
        </div>
      </div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 8px">
      <span style="font-size: 12px; font-weight: 700; color: #6B5A4E; letter-spacing: 0.8px">POOJA ITEMS</span>
      <div style="background: #FFFFFF; border: 1px solid #E9DCC4; border-radius: 16px; display: flex; flex-direction: column">
        <div style="display: flex; align-items: center; gap: 12px; padding: 14px 16px; min-height: 60px">
          <span style="flex: 1; display: flex; flex-direction: column; gap: 2px"><span style="font-size: 16px; font-weight: 600">Turmeric</span><span style="font-size: 13px; color: #6B5A4E">[qty] kg · Anand</span></span>
          <button style="min-height: 36px; padding: 0 12px; border-radius: 999px; border: none; background: #F7E4E1; color: #7A1F2B; font: 700 13px 'Plus Jakarta Sans', sans-serif">Needed</button>
        </div>
      </div>
    </div>
    </div>
    </sc-if>
    <sc-if value="{{buyOnce}}" hint-placeholder-val="{{ false }}">
    <div style="display: flex; flex-direction: column; gap: 14px">
      <div style="background: #F8ECCB; border: 1px solid #EAD9A8; border-radius: 14px; padding: 12px 14px; display: flex; gap: 10px; align-items: flex-start">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6E5208" stroke-width="2" stroke-linecap="round" aria-hidden="true" style="flex: none; margin-top: 1px"><circle cx="12" cy="12" r="9"></circle><path d="M12 11v6M12 7.5v.5"></path></svg>
        <span style="font-size: 14px; line-height: 1.45; color: #4F4036">Items needed in more than one event are listed first, so you can buy them once and use them again.</span>
      </div>
      <div style="background: #FFFFFF; border: 1px solid #E9DCC4; border-radius: 16px; padding: 16px; display: flex; flex-direction: column; gap: 12px">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px">
          <span style="font-size: 18px; font-weight: 700">Roses</span>
          <span style="font-size: 12px; font-weight: 700; background: #F7E4E1; color: #7A1F2B; padding: 4px 10px; border-radius: 999px">Flowers</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; background: #FBF6EC; border-radius: 12px; padding: 12px">
          <span style="display: flex; flex-direction: column; gap: 2px"><span style="font-size: 12px; font-weight: 600; color: #6B5A4E">Total needed</span><span style="font-size: 18px; font-weight: 800">100 pieces</span></span>
          <span style="display: flex; flex-direction: column; gap: 2px"><span style="font-size: 12px; font-weight: 600; color: #6B5A4E">No. of events</span><span style="font-size: 18px; font-weight: 800">1</span></span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap">
          <span style="font-size: 13px; font-weight: 600; color: #6B5A4E">Used in:</span>
          <span style="font-size: 13px; font-weight: 700; background: #F8ECCB; color: #6E5208; padding: 4px 10px; border-radius: 999px">Haldi · 26 Apr</span>
        </div>
      </div>
      <div style="border: 2px dashed #D9C9AC; border-radius: 16px; padding: 14px 16px; font-size: 14px; line-height: 1.45; color: #6B5A4E">When the same item is added for two or more events, it shows here once with the combined total.</div>
    </div>
    </sc-if>
    <a href="AddRequirement.dc.html" style="min-height: 52px; border-radius: 26px; background: #7A1F2B; color: #FFFFFF; font-size: 16px; font-weight: 700; display: flex; align-items: center; justify-content: center; text-decoration: none">+ Add a requirement</a>
  </div>
  <!-- bottom tab bar: built already -->
</div>
```


## Screen 2.5 · Add a requirement

```html
<div style="width: 390px; height: 1400px; background: #FBF6EC; position: relative; overflow: hidden; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; color: #2A1A14">
  <div aria-hidden="true" style="height: 14px; background: radial-gradient(circle, #C99A2E 1.7px, transparent 2.2px) 0 0 / 14px 14px, #7A1F2B; border-bottom: 2px solid #C99A2E"></div>
  <div style="padding: 12px 20px 24px; height: 1384px; box-sizing: border-box; display: flex; flex-direction: column; gap: 22px">
    <a href="Requirements.dc.html" style="align-self: flex-start; display: flex; align-items: center; gap: 6px; min-height: 44px; padding: 0 16px 0 10px; border-radius: 22px; background: #FFFFFF; border: 1px solid #E9DCC4; text-decoration: none; color: #2A1A14; font-size: 15px; font-weight: 700"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"></path></svg>Cancel</a>
    <h1 style="margin: 0; font-size: 28px">Add a requirement</h1>
    <div style="display: flex; flex-direction: column; gap: 8px">
      <span style="font-size: 15px; font-weight: 700">For which event?</span>
      <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px">
        <sc-for list="{{events}}" as="e" hint-placeholder-count="2">
          <button sc-camel-on-click="{{e.pick}}" aria-pressed="{{e.pressed}}" style="{{e.style}}">{{e.label}}</button>
        </sc-for>
      </div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 8px">
      <span style="font-size: 15px; font-weight: 700">Category</span>
      <div style="display: flex; flex-wrap: wrap; gap: 8px">
        <sc-for list="{{cats}}" as="c" hint-placeholder-count="4">
          <span style="{{c.wrapStyle}}">
            <button sc-camel-on-click="{{c.pick}}" aria-pressed="{{c.pressed}}" style="{{c.style}}">{{c.label}}</button>
            <button sc-camel-on-click="{{c.remove}}" aria-label="{{c.removeAria}}" style="{{c.xStyle}}">×</button>
          </span>
        </sc-for>
      </div>
      <div style="display: flex; gap: 8px">
        <input aria-label="Add a new category" value="{{catDraft}}" sc-camel-on-change="{{setCatDraft}}" placeholder="Add a new category, e.g. Lighting" style="flex: 1; min-width: 0; height: 48px; border-radius: 12px; border: 1px solid #D9C9AC; background: #FFFFFF; padding: 0 14px; font: 500 15px 'Plus Jakarta Sans', sans-serif; color: #2A1A14">
        <button sc-camel-on-click="{{addCat}}" style="height: 48px; padding: 0 16px; border-radius: 12px; border: 1.5px solid #7A1F2B; background: #FFFFFF; font: 700 15px 'Plus Jakarta Sans', sans-serif; color: #7A1F2B; cursor: pointer">+ Add</button>
      </div>
    </div>
    <label style="display: flex; flex-direction: column; gap: 8px; font-size: 15px; font-weight: 700">Item
      <input placeholder="e.g. Marigold garlands" style="height: 52px; border-radius: 12px; border: 1px solid #D9C9AC; background: #FFFFFF; padding: 0 16px; font: 500 16px 'Plus Jakarta Sans', sans-serif; color: #2A1A14">
    </label>
    <div style="display: flex; flex-direction: column; gap: 8px">
      <span style="font-size: 15px; font-weight: 700">How much?</span>
      <div style="display: flex; align-items: center; justify-content: space-between; border-radius: 12px; border: 1px solid #D9C9AC; background: #FFFFFF">
        <button aria-label="Less" sc-camel-on-click="{{qtyDown}}" style="width: 52px; height: 52px; border: none; background: transparent; font: 700 22px 'Plus Jakarta Sans', sans-serif; color: #2A1A14; cursor: pointer">−</button>
        <span style="font-size: 20px; font-weight: 800">{{qtyLabel}}</span>
        <button aria-label="More" sc-camel-on-click="{{qtyUp}}" style="width: 52px; height: 52px; border: none; background: transparent; font: 700 22px 'Plus Jakarta Sans', sans-serif; color: #2A1A14; cursor: pointer">+</button>
      </div>
      <span style="font-size: 13px; font-weight: 600; color: #6B5A4E">Unit</span>
      <div style="display: flex; flex-wrap: wrap; gap: 8px">
        <sc-for list="{{units}}" as="u" hint-placeholder-count="5">
          <button sc-camel-on-click="{{u.pick}}" aria-pressed="{{u.pressed}}" style="{{u.style}}">{{u.label}}</button>
        </sc-for>
      </div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 10px">
      <span style="display: flex; justify-content: space-between; align-items: baseline"><span style="font-size: 15px; font-weight: 700">Who arranges it?</span><span style="font-size: 13px; color: #6B5A4E">{{countLabel}}</span></span>
      <div style="display: flex; flex-wrap: wrap; gap: 8px">
        <sc-for list="{{people}}" as="p" hint-placeholder-count="2">
          <span style="{{p.wrapStyle}}">
            <button sc-camel-on-click="{{p.pick}}" aria-pressed="{{p.pressed}}" style="{{p.style}}">{{p.label}}</button>
            <button sc-camel-on-click="{{p.remove}}" aria-label="{{p.removeAria}}" style="{{p.xStyle}}">×</button>
          </span>
        </sc-for>
      </div>
      <div style="display: flex; gap: 8px">
        <input aria-label="Add a new name" value="{{draft}}" sc-camel-on-change="{{setDraft}}" placeholder="Add a new name" style="flex: 1; min-width: 0; height: 48px; border-radius: 12px; border: 1px solid #D9C9AC; background: #FFFFFF; padding: 0 14px; font: 500 15px 'Plus Jakarta Sans', sans-serif; color: #2A1A14">
        <button sc-camel-on-click="{{addName}}" style="height: 48px; padding: 0 16px; border-radius: 12px; border: 1.5px solid #7A1F2B; background: #FFFFFF; font: 700 15px 'Plus Jakarta Sans', sans-serif; color: #7A1F2B; cursor: pointer">+ Add</button>
      </div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 8px">
      <span style="font-size: 15px; font-weight: 700">Status</span>
      <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px">
        <button sc-camel-on-click="{{setNeeded}}" style="{{neededStyle}}">Needed</button>
        <button sc-camel-on-click="{{setArranged}}" style="{{arrangedStyle}}">Arranged</button>
      </div>
    </div>
    <a href="Requirements.dc.html" style="margin-top: auto; min-height: 56px; border-radius: 28px; background: #7A1F2B; color: #FFFFFF; font-size: 17px; font-weight: 700; display: flex; align-items: center; justify-content: center; text-decoration: none">Add requirement</a>
  </div>
</div>
```


## Screen 2.6 · Edit event

```html
<div style="width: 390px; height: 2540px; background: #FBF6EC; position: relative; overflow: hidden; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; color: #2A1A14">
  <div aria-hidden="true" style="height: 14px; background: radial-gradient(circle, #C99A2E 1.7px, transparent 2.2px) 0 0 / 14px 14px, #7A1F2B; border-bottom: 2px solid #C99A2E"></div>
  <div style="padding: 12px 20px 24px; height: 2524px; box-sizing: border-box; display: flex; flex-direction: column; gap: 22px">
    <a href="EventDetail.dc.html" style="align-self: flex-start; display: flex; align-items: center; gap: 6px; min-height: 44px; padding: 0 16px 0 10px; border-radius: 22px; background: #FFFFFF; border: 1px solid #E9DCC4; text-decoration: none; color: #2A1A14; font-size: 15px; font-weight: 700"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"></path></svg>Cancel</a>
    <h1 style="margin: 0; font-size: 28px">Edit event</h1>
    <div style="display: flex; flex-direction: column; gap: 10px">
      <span style="font-size: 15px; font-weight: 700">Which event?</span>
      <div style="display: flex; flex-wrap: wrap; gap: 8px">
        <sc-for list="{{evChips}}" as="ec" hint-placeholder-count="5">
          <span style="{{ec.wrapStyle}}">
            <button sc-camel-on-click="{{ec.pick}}" aria-pressed="{{ec.pressed}}" style="{{ec.style}}">{{ec.label}}</button>
            <button sc-camel-on-click="{{ec.remove}}" aria-label="{{ec.removeAria}}" style="{{ec.xStyle}}">×</button>
          </span>
        </sc-for>
      </div>
      <div style="display: flex; gap: 8px">
        <input aria-label="Add your own event" value="{{evDraft}}" sc-camel-on-change="{{setEvDraft}}" placeholder="Add your own, e.g. Nalugu" style="flex: 1; min-width: 0; height: 48px; border-radius: 12px; border: 1px solid #D9C9AC; background: #FFFFFF; padding: 0 14px; font: 500 15px 'Plus Jakarta Sans', sans-serif; color: #2A1A14">
        <button sc-camel-on-click="{{addEv}}" style="height: 48px; padding: 0 16px; border-radius: 12px; border: 1.5px solid #7A1F2B; background: #FFFFFF; font: 700 15px 'Plus Jakarta Sans', sans-serif; color: #7A1F2B; cursor: pointer">+ Add</button>
      </div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 8px">
      <div style="display: flex; justify-content: space-between; align-items: baseline">
        <span style="font-size: 15px; font-weight: 700">Date</span>
        <span style="font-size: 15px; font-weight: 700; color: #7A1F2B">{{dateLabel}}</span>
      </div>
      <div style="background: #FFFFFF; border: 1px solid #E9DCC4; border-radius: 16px; padding: 12px; display: flex; flex-direction: column; gap: 8px">
        <div style="display: flex; align-items: center; justify-content: space-between">
          <button aria-label="Previous month" sc-camel-on-click="{{prevMonth}}" style="width: 44px; height: 44px; border-radius: 22px; border: none; background: #FBF6EC; display: flex; align-items: center; justify-content: center"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2A1A14" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"></path></svg></button>
          <span style="font-size: 16px; font-weight: 700">{{monthLabel}}</span>
          <button aria-label="Next month" sc-camel-on-click="{{nextMonth}}" style="width: 44px; height: 44px; border-radius: 22px; border: none; background: #FBF6EC; display: flex; align-items: center; justify-content: center"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2A1A14" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M9 5l7 7-7 7"></path></svg></button>
        </div>
        <div style="display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 4px; text-align: center; font-size: 12px; font-weight: 700; color: #6B5A4E">
          <span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span><span>Su</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 4px">
          <sc-for list="{{cells}}" as="c" hint-placeholder-count="35">
            <button sc-camel-on-click="{{c.pick}}" disabled="{{c.blank}}" aria-label="{{c.aria}}" style="{{c.style}}">{{c.label}}</button>
          </sc-for>
        </div>
      </div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 8px">
      <div style="display: flex; justify-content: space-between; align-items: baseline">
        <span style="font-size: 15px; font-weight: 700">Start time</span>
        <span style="font-size: 15px; font-weight: 700; color: #7A1F2B">{{timeLabel}}</span>
      </div>
      <div style="background: #FFFFFF; border: 1px solid #E9DCC4; border-radius: 16px; padding: 12px; display: flex; flex-direction: column; gap: 12px">
        <div style="display: flex; align-items: center; gap: 10px">
          <span style="font-size: 14px; font-weight: 600; color: #4F4036; width: 52px">Hour</span>
          <div style="flex: 1; display: flex; align-items: center; justify-content: space-between; border-radius: 12px; border: 1px solid #D9C9AC">
            <button aria-label="Earlier hour" sc-camel-on-click="{{hourDown}}" style="width: 48px; height: 48px; border: none; background: transparent; font: 700 22px 'Plus Jakarta Sans', sans-serif; color: #2A1A14">−</button>
            <span style="font-size: 20px; font-weight: 800">{{hour}}</span>
            <button aria-label="Later hour" sc-camel-on-click="{{hourUp}}" style="width: 48px; height: 48px; border: none; background: transparent; font: 700 22px 'Plus Jakarta Sans', sans-serif; color: #2A1A14">+</button>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 10px">
          <span style="font-size: 14px; font-weight: 600; color: #4F4036; width: 52px">Minute</span>
          <div style="flex: 1; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px">
            <sc-for list="{{mins}}" as="mn" hint-placeholder-count="4">
              <button sc-camel-on-click="{{mn.pick}}" style="{{mn.style}}">{{mn.label}}</button>
            </sc-for>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px">
          <button sc-camel-on-click="{{pickAm}}" style="{{amStyle}}">Morning (AM)</button>
          <button sc-camel-on-click="{{pickPm}}" style="{{pmStyle}}">Afternoon / Evening (PM)</button>
        </div>
      </div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 8px">
      <span style="font-size: 15px; font-weight: 700">Dress code for this event?</span>
      <div role="radiogroup" aria-label="Dress code" style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px">
        <button role="radio" aria-checked="{{dressYesStr}}" sc-camel-on-click="{{dressYes}}" style="{{dressYesStyle}}">Yes</button>
        <button role="radio" aria-checked="{{dressNoStr}}" sc-camel-on-click="{{dressNo}}" style="{{dressNoStyle}}">No</button>
      </div>
      <sc-if value="{{hasDress}}" hint-placeholder-val="{{ false }}">
        <input aria-label="Describe the dress code" sc-camel-default-value="Yellow" placeholder="e.g. Yellow traditional, silk sarees and veshti" style="height: 52px; border-radius: 12px; border: 1px solid #D9C9AC; background: #FFFFFF; padding: 0 16px; font: 500 16px 'Plus Jakarta Sans', sans-serif; color: #2A1A14">
      </sc-if>
    </div>
    <div style="display: flex; align-items: center; justify-content: space-between">
      <span style="display: flex; flex-direction: column; gap: 2px"><span style="font-size: 15px; font-weight: 700">Expected guests</span><span style="font-size: 13px; color: #6B5A4E">A rough number is fine</span></span>
      <div style="display: flex; align-items: center; gap: 4px; border-radius: 12px; border: 1px solid #D9C9AC; background: #FFFFFF">
        <button aria-label="Fewer guests" sc-camel-on-click="{{guestsDown}}" style="width: 48px; height: 48px; border: none; background: transparent; font: 700 22px 'Plus Jakarta Sans', sans-serif; color: #2A1A14">−</button>
        <span style="width: 44px; text-align: center; font-size: 18px; font-weight: 700">{{guests}}</span>
        <button aria-label="More guests" sc-camel-on-click="{{guestsUp}}" style="width: 48px; height: 48px; border: none; background: transparent; font: 700 22px 'Plus Jakarta Sans', sans-serif; color: #2A1A14">+</button>
      </div>
    </div>
    <div style="display: flex; align-items: center; gap: 10px; font-size: 12px; font-weight: 800; letter-spacing: 1.5px; color: #8A6A1E"><span>VENDORS</span><span aria-hidden="true" style="flex: 1; height: 1px; background: #E2CF9F"></span></div>
    <div style="display: flex; flex-direction: column; gap: 10px">
      <span style="display: flex; justify-content: space-between; align-items: baseline"><span style="font-size: 15px; font-weight: 700">Vendors for this event</span><span style="font-size: 13px; color: #6B5A4E">{{vendorCount}}</span></span>
      <sc-if value="{{noVendors}}" hint-placeholder-val="{{ false }}">
        <div style="border: 2px dashed #D9C9AC; border-radius: 14px; padding: 14px; font-size: 14px; color: #6B5A4E; text-align: center">No vendors yet. Add the decorator, caterer, priest or photographer below.</div>
      </sc-if>
      <sc-for list="{{vendors}}" as="vd" hint-placeholder-count="1">
        <div style="background: #FFFFFF; border: 1px solid #E9DCC4; border-radius: 14px; padding: 12px; display: flex; align-items: center; gap: 12px; margin-bottom: 8px">
          <span style="width: 40px; height: 40px; border-radius: 20px; background: #F8ECCB; color: #6E5208; display: flex; align-items: center; justify-content: center; font-weight: 800; flex: none">{{vd.initial}}</span>
          <span style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px"><span style="font-size: 15px; font-weight: 800">{{vd.name}}</span><span style="font-size: 13px; color: #6B5A4E">{{vd.service}}</span><a href="{{vd.tel}}" style="font-size: 14px; font-weight: 700">{{vd.phone}}</a></span>
          <button sc-camel-on-click="{{vd.remove}}" aria-label="{{vd.removeAria}}" style="width: 40px; height: 40px; border-radius: 10px; border: 1px solid #E9DCC4; background: #FFFFFF; display: flex; align-items: center; justify-content: center; flex: none; cursor: pointer"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#7A1F2B" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"></path><path d="M10 11v6M14 11v6"></path></svg></button>
        </div>
      </sc-for>
      <div style="background: #FFFFFF; border: 1px solid #E9DCC4; border-radius: 14px; padding: 12px; display: flex; flex-direction: column; gap: 8px">
        <span style="font-size: 14px; font-weight: 700">Add a vendor</span>
        <input aria-label="Vendor name" value="{{vName}}" sc-camel-on-change="{{setVName}}" placeholder="Vendor or shop name" style="height: 48px; border-radius: 12px; border: 1px solid #D9C9AC; background: #FFFFFF; padding: 0 14px; font: 500 15px 'Plus Jakarta Sans', sans-serif; color: #2A1A14">
        <input aria-label="What they do" value="{{vService}}" sc-camel-on-change="{{setVService}}" placeholder="What they do, e.g. Decorator, Caterer" style="height: 48px; border-radius: 12px; border: 1px solid #D9C9AC; background: #FFFFFF; padding: 0 14px; font: 500 15px 'Plus Jakarta Sans', sans-serif; color: #2A1A14">
        <input type="tel" inputmode="tel" aria-label="Contact number" value="{{vPhone}}" sc-camel-on-change="{{setVPhone}}" placeholder="Contact number, e.g. +91 98765 43210" style="height: 48px; border-radius: 12px; border: 1px solid #D9C9AC; background: #FFFFFF; padding: 0 14px; font: 500 15px 'Plus Jakarta Sans', sans-serif; color: #2A1A14">
        <button sc-camel-on-click="{{addVendor}}" style="height: 48px; padding: 0 16px; border-radius: 12px; border: 1.5px solid #7A1F2B; background: #FFFFFF; font: 700 15px 'Plus Jakarta Sans', sans-serif; color: #7A1F2B; cursor: pointer">+ Add vendor</button>
      </div>
    </div>
    <div style="display: flex; align-items: center; gap: 10px; font-size: 12px; font-weight: 800; letter-spacing: 1.5px; color: #8A6A1E"><span>DECORATION</span><span aria-hidden="true" style="flex: 1; height: 1px; background: #E2CF9F"></span></div>
    <div style="display: flex; flex-direction: column; gap: 10px">
      <span style="font-size: 15px; font-weight: 700">Decor items</span>
      <div style="display: flex; flex-wrap: wrap; gap: 6px">
        <sc-for list="{{decor}}" as="dc" hint-placeholder-count="2">
          <span style="display: inline-flex; align-items: center; padding: 0 2px 0 12px; border-radius: 999px; background: #F7E4E1; border: 1px solid #E8C4BE; color: #7A1F2B; font-size: 14px; font-weight: 700">{{dc.label}}<button sc-camel-on-click="{{dc.remove}}" aria-label="{{dc.aria}}" style="width: 36px; height: 36px; border: none; background: transparent; font: 600 18px 'Plus Jakarta Sans', sans-serif; color: #7A1F2B; cursor: pointer">×</button></span>
        </sc-for>
      </div>
      <sc-if value="{{hasSuggest}}" hint-placeholder-val="{{ true }}">
        <span style="font-size: 13px; color: #6B5A4E">Tap to add:</span>
        <div style="display: flex; flex-wrap: wrap; gap: 6px">
          <sc-for list="{{suggest}}" as="sg" hint-placeholder-count="4">
            <button sc-camel-on-click="{{sg.add}}" style="min-height: 38px; padding: 0 12px; border-radius: 999px; border: 1px dashed #B9A684; background: #FFFFFF; font: 600 13px 'Plus Jakarta Sans', sans-serif; color: #4F4036; cursor: pointer">+ {{sg.label}}</button>
          </sc-for>
        </div>
      </sc-if>
      <div style="display: flex; gap: 8px">
        <input aria-label="Add a decor item" value="{{decorDraft}}" sc-camel-on-change="{{setDecorDraft}}" placeholder="Add your own decor item" style="flex: 1; min-width: 0; height: 48px; border-radius: 12px; border: 1px solid #D9C9AC; background: #FFFFFF; padding: 0 14px; font: 500 15px 'Plus Jakarta Sans', sans-serif; color: #2A1A14">
        <button sc-camel-on-click="{{addDecor}}" style="height: 48px; padding: 0 16px; border-radius: 12px; border: 1.5px solid #7A1F2B; background: #FFFFFF; font: 700 15px 'Plus Jakarta Sans', sans-serif; color: #7A1F2B; cursor: pointer">+ Add</button>
      </div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 10px">
      <span style="display: flex; justify-content: space-between; align-items: baseline"><span style="font-size: 15px; font-weight: 700">Decoration photos</span><span style="font-size: 13px; color: #6B5A4E">{{photoCount}}</span></span>
      <span style="font-size: 13px; color: #6B5A4E">Add ideas or photos from the decorator so everyone knows the look.</span>
      <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px">
        <button sc-camel-on-click="{{addPhoto}}" style="aspect-ratio: 1; border-radius: 14px; border: 2px dashed #B9A684; background: #FFFFFF; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; font: 700 13px 'Plus Jakarta Sans', sans-serif; color: #7A1F2B; cursor: pointer"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#7A1F2B" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z"></path><circle cx="12" cy="13" r="3.5"></circle></svg>Add photo</button>
        <sc-for list="{{photos}}" as="ph" hint-placeholder-count="2">
          <div style="position: relative; aspect-ratio: 1; border-radius: 14px; overflow: hidden; background: radial-gradient(circle, rgba(201,154,46,0.45) 1.5px, transparent 2px) 0 0 / 12px 12px, {{ph.bg}}; display: flex; align-items: flex-end; padding: 8px; box-sizing: border-box">
            <span style="font-size: 12px; font-weight: 700; color: #FFFFFF; background: rgba(42,26,20,0.55); padding: 2px 8px; border-radius: 999px">{{ph.label}}</span>
            <button sc-camel-on-click="{{ph.remove}}" aria-label="{{ph.aria}}" style="position: absolute; top: 4px; right: 4px; width: 32px; height: 32px; border-radius: 16px; border: none; background: rgba(255,255,255,0.92); font: 700 16px 'Plus Jakarta Sans', sans-serif; color: #7A1F2B; cursor: pointer">×</button>
          </div>
        </sc-for>
      </div>
    </div>
    <a href="EventDetail.dc.html" style="margin-top: auto; min-height: 56px; border-radius: 28px; background: #7A1F2B; color: #FFFFFF; font-size: 17px; font-weight: 700; display: flex; align-items: center; justify-content: center; text-decoration: none">Save changes</a>
    <a href="Events.dc.html" style="min-height: 48px; border-radius: 24px; border: 1.5px solid #D9C9AC; background: #FFFFFF; color: #7A1F2B; font-size: 15px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 8px; text-decoration: none"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7A1F2B" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"></path><path d="M10 11v6M14 11v6"></path></svg>Delete this event</a>
  </div>
</div>
```


## Screen 3.1 · Guests & RSVPs

```html
<div style="width: 390px; height: 900px; background: #FBF6EC; position: relative; overflow: hidden; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; color: #2A1A14">
  <div aria-hidden="true" style="height: 14px; background: radial-gradient(circle, #C99A2E 1.7px, transparent 2.2px) 0 0 / 14px 14px, #7A1F2B; border-bottom: 2px solid #C99A2E"></div>
  <div style="padding: 12px 20px 100px; display: flex; flex-direction: column; gap: 18px">
    <a href="Main.dc.html" style="align-self: flex-start; display: flex; align-items: center; gap: 6px; min-height: 44px; padding: 0 16px 0 10px; border-radius: 22px; background: #FFFFFF; border: 1px solid #E9DCC4; text-decoration: none; color: #2A1A14; font-size: 15px; font-weight: 700"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"></path></svg>Home</a>
    <h1 style="margin: 0; font-size: 28px">Guests</h1>
    <div style="display: flex; flex-direction: column; gap: 12px">
      <h2 style="margin: 0; font-size: 20px">RSVPs by event</h2>
      <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px">
        <button sc-camel-on-click="{{pickMehandi}}" style="{{mehandiStyle}}">Mehandi · 22 Apr</button>
        <button sc-camel-on-click="{{pickHaldi}}" style="{{haldiStyle}}">Haldi · 26 Apr</button>
      </div>
      <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px">
        <div style="background: #FFFFFF; border: 1px solid #E9DCC4; border-radius: 14px; padding: 12px; display: flex; flex-direction: column; gap: 2px">
          <span style="font-size: 13px; font-weight: 600; color: #6B5A4E">Invited</span>
          <span style="font-size: 26px; font-weight: 800">{{invited}}</span>
        </div>
        <div style="background: #E4EDE0; border: 1px solid #C9DBC3; border-radius: 14px; padding: 12px; display: flex; flex-direction: column; gap: 2px">
          <span style="font-size: 13px; font-weight: 600; color: #2F5D3A">Confirmed</span>
          <span style="font-size: 26px; font-weight: 800; color: #2F5D3A">{{confirmed}}</span>
        </div>
        <div style="background: #F8ECCB; border: 1px solid #EAD9A8; border-radius: 14px; padding: 12px; display: flex; flex-direction: column; gap: 2px">
          <span style="font-size: 13px; font-weight: 600; color: #6E5208">Pending</span>
          <span style="font-size: 26px; font-weight: 800; color: #6E5208">{{pending}}</span>
        </div>
      </div>
      <sc-if value="{{hasGuests}}" hint-placeholder-val="{{ true }}">
        <div style="background: #FFFFFF; border: 1px solid #E9DCC4; border-radius: 16px; padding: 16px; display: flex; flex-direction: column; gap: 12px">
          <div style="display: flex; align-items: center; gap: 12px">
            <span style="width: 44px; height: 44px; border-radius: 22px; background: #F7E4E1; color: #7A1F2B; display: flex; align-items: center; justify-content: center; font-weight: 800; flex: none">S</span>
            <span style="flex: 1; display: flex; flex-direction: column; gap: 2px"><span style="font-size: 17px; font-weight: 700">Satyam</span><span style="font-size: 14px; color: #6B5A4E">Groom’s side · 1 person</span></span>
          </div>
          <div role="group" aria-label="RSVP for Satyam" style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px">
            <button sc-camel-on-click="{{setYes}}" style="{{yesStyle}}">Coming</button>
            <button sc-camel-on-click="{{setWait}}" style="{{waitStyle}}">Pending</button>
            <button sc-camel-on-click="{{setNo}}" style="{{noStyle}}">Not coming</button>
          </div>
        </div>
      </sc-if>
      <sc-if value="{{noGuests}}" hint-placeholder-val="{{ false }}">
        <div style="border: 2px dashed #D9C9AC; border-radius: 16px; padding: 18px; text-align: center; font-size: 15px; color: #6B5A4E">No guests invited to Haldi yet.</div>
      </sc-if>
    </div>
    <a href="AddGuest.dc.html" style="min-height: 52px; border-radius: 26px; background: #7A1F2B; color: #FFFFFF; font-size: 16px; font-weight: 700; display: flex; align-items: center; justify-content: center; text-decoration: none">+ Add a guest</a>
  </div>
  <!-- bottom tab bar: built already -->
</div>
```


## Screen 3.2 · Add a guest

```html
<div style="width: 390px; height: 960px; background: #FBF6EC; position: relative; overflow: hidden; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; color: #2A1A14">
  <div aria-hidden="true" style="height: 14px; background: radial-gradient(circle, #C99A2E 1.7px, transparent 2.2px) 0 0 / 14px 14px, #7A1F2B; border-bottom: 2px solid #C99A2E"></div>
  <div style="padding: 16px 20px 24px; height: 944px; box-sizing: border-box; display: flex; flex-direction: column; gap: 22px">
    <a href="Guests.dc.html" style="align-self: flex-start; display: flex; align-items: center; gap: 6px; min-height: 44px; padding: 0 16px 0 10px; border-radius: 22px; background: #FFFFFF; border: 1px solid #E9DCC4; text-decoration: none; color: #2A1A14; font-size: 15px; font-weight: 700"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"></path></svg>Cancel</a>
    <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px">Add a guest</h1>
    <label style="display: flex; flex-direction: column; gap: 8px; font-size: 15px; font-weight: 700">Name
      <input placeholder="Person or family name" style="height: 52px; border-radius: 12px; border: 1px solid #D9C9AC; background: #FFFFFF; padding: 0 16px; font: 500 16px 'Plus Jakarta Sans', sans-serif; color: #2A1A14">
    </label>
    <label style="display: flex; flex-direction: column; gap: 8px; font-size: 15px; font-weight: 700">Phone
      <input placeholder="+91 98765 43210" style="height: 52px; border-radius: 12px; border: 1px solid #D9C9AC; background: #FFFFFF; padding: 0 16px; font: 500 16px 'Plus Jakarta Sans', sans-serif; color: #2A1A14">
    </label>
    <div style="display: flex; flex-direction: column; gap: 8px">
      <span style="font-size: 15px; font-weight: 700">Which side?</span>
      <div style="display: flex; gap: 10px">
        <button aria-pressed="true" style="flex: 1; min-height: 52px; border-radius: 12px; border: 2px solid #7A1F2B; background: #F7E4E1; font: 700 16px 'Plus Jakarta Sans', sans-serif; color: #7A1F2B">Groom</button>
        <button aria-pressed="false" style="flex: 1; min-height: 52px; border-radius: 12px; border: 1px solid #D9C9AC; background: #FFFFFF; font: 600 16px 'Plus Jakarta Sans', sans-serif; color: #2A1A14">Bride</button>
      </div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 8px">
      <span style="font-size: 15px; font-weight: 700">Invite to</span>
      <div style="display: flex; gap: 10px">
        <button aria-pressed="true" style="flex: 1; min-height: 52px; border-radius: 12px; border: 2px solid #7A1F2B; background: #F7E4E1; font: 700 16px 'Plus Jakarta Sans', sans-serif; color: #7A1F2B">✓ Mehandi</button>
        <button aria-pressed="false" style="flex: 1; min-height: 52px; border-radius: 12px; border: 1px solid #D9C9AC; background: #FFFFFF; font: 600 16px 'Plus Jakarta Sans', sans-serif; color: #2A1A14">Haldi</button>
      </div>
    </div>
    <div style="display: flex; align-items: center; justify-content: space-between">
      <span style="font-size: 15px; font-weight: 700">How many people?</span>
      <div style="display: flex; align-items: center; gap: 4px; border-radius: 12px; border: 1px solid #D9C9AC; background: #FFFFFF">
        <button aria-label="Fewer people" style="width: 48px; height: 48px; border: none; background: transparent; font: 700 22px 'Plus Jakarta Sans', sans-serif; color: #2A1A14">−</button>
        <span style="width: 32px; text-align: center; font-size: 18px; font-weight: 700">1</span>
        <button aria-label="More people" style="width: 48px; height: 48px; border: none; background: transparent; font: 700 22px 'Plus Jakarta Sans', sans-serif; color: #2A1A14">+</button>
      </div>
    </div>
    <label style="display: flex; flex-direction: column; gap: 8px; font-size: 15px; font-weight: 700">Notes <span style="font-weight: 500; color: #6B5A4E; font-size: 14px">Optional</span>
      <textarea placeholder="e.g. vegetarian, arriving a day early" rows="3" style="border-radius: 12px; border: 1px solid #D9C9AC; background: #FFFFFF; padding: 14px 16px; font: 500 16px 'Plus Jakarta Sans', sans-serif; color: #2A1A14; resize: none"></textarea>
    </label>
    <a href="Guests.dc.html" style="margin-top: auto; min-height: 56px; border-radius: 28px; background: #7A1F2B; color: #FFFFFF; font-size: 17px; font-weight: 700; display: flex; align-items: center; justify-content: center; text-decoration: none">Save guest</a>
  </div>
</div>
```


## Screen 3.3 · Accommodation

```html
<div style="width: 390px; height: 1640px; background: #FBF6EC; position: relative; overflow: hidden; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; color: #2A1A14">
  <div aria-hidden="true" style="height: 14px; background: radial-gradient(circle, #C99A2E 1.7px, transparent 2.2px) 0 0 / 14px 14px, #7A1F2B; border-bottom: 2px solid #C99A2E"></div>
  <div style="padding: 12px 20px 100px; display: flex; flex-direction: column; gap: 18px">
    <a href="Main.dc.html" style="align-self: flex-start; display: flex; align-items: center; gap: 6px; min-height: 44px; padding: 0 16px 0 10px; border-radius: 22px; background: #FFFFFF; border: 1px solid #E9DCC4; text-decoration: none; color: #2A1A14; font-size: 15px; font-weight: 700"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"></path></svg>Home</a>
    <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px">
      <h1 style="margin: 0; font-size: 28px">Accommodation</h1>
      <a href="AddStay.dc.html" style="min-height: 44px; padding: 0 16px; border-radius: 22px; background: #7A1F2B; color: #FFFFFF; font-size: 15px; font-weight: 700; display: flex; align-items: center; text-decoration: none; white-space: nowrap">+ Add a stay</a>
    </div>
    <div style="background: radial-gradient(circle, rgba(201,154,46,0.28) 1.4px, transparent 2px) 0 0 / 16px 16px, #7A1F2B; border: 2px solid #C99A2E; border-radius: 18px; padding: 16px; color: #FFFFFF; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; text-align: center">
      <span style="display: flex; flex-direction: column; gap: 2px"><span style="font-size: 22px; font-weight: 800">{{totalRooms}}</span><span style="font-size: 12px; color: #F1DDB0">rooms</span></span>
      <span style="display: flex; flex-direction: column; gap: 2px"><span style="font-size: 22px; font-weight: 800">{{placeCount}}</span><span style="font-size: 12px; color: #F1DDB0">places</span></span>
      <span style="display: flex; flex-direction: column; gap: 2px"><span style="font-size: 22px; font-weight: 800">{{totalNights}}</span><span style="font-size: 12px; color: #F1DDB0">nights</span></span>
      <span style="display: flex; flex-direction: column; gap: 2px"><span style="font-size: 22px; font-weight: 800">{{guestCount}}</span><span style="font-size: 12px; color: #F1DDB0">guests</span></span>
    </div>
    <span style="font-size: 14px; color: #4F4036">{{rangeLabel}}</span>
    <sc-for list="{{stays}}" as="st" hint-placeholder-count="2">
      <div style="background: #FFFFFF; border: 1px solid #E9DCC4; border-radius: 18px; padding: 16px; display: flex; flex-direction: column; gap: 14px; margin-bottom: 16px">
        <div style="display: flex; align-items: flex-start; gap: 12px">
          <span style="width: 44px; height: 44px; border-radius: 12px; background: #F8ECCB; display: flex; align-items: center; justify-content: center; flex: none"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6E5208" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 21V8l9-5 9 5v13"></path><path d="M9 21v-6h6v6"></path><path d="M3 21h18"></path></svg></span>
          <span style="flex: 1; display: flex; flex-direction: column; gap: 2px"><span style="font-size: 17px; font-weight: 800">{{st.name}}</span><span style="font-size: 13px; color: #6B5A4E">{{st.area}}</span></span>
          <span style="font-size: 12px; font-weight: 700; background: #F7E4E1; color: #7A1F2B; padding: 4px 10px; border-radius: 999px; white-space: nowrap">{{st.nightsLabel}}</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; background: #FBF6EC; border-radius: 12px; padding: 12px">
          <span style="display: flex; flex-direction: column; gap: 2px"><span style="font-size: 12px; font-weight: 600; color: #6B5A4E">Check-in</span><span style="font-size: 15px; font-weight: 700">{{st.from}}</span></span>
          <span style="display: flex; flex-direction: column; gap: 2px"><span style="font-size: 12px; font-weight: 600; color: #6B5A4E">Check-out</span><span style="font-size: 15px; font-weight: 700">{{st.to}}</span></span>
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between">
          <span style="font-size: 15px; font-weight: 700">Rooms booked</span>
          <div style="display: flex; align-items: center; border-radius: 12px; border: 1px solid #D9C9AC">
            <button aria-label="{{st.roomsDownAria}}" sc-camel-on-click="{{st.roomsDown}}" style="width: 44px; height: 44px; border: none; background: transparent; font: 700 20px 'Plus Jakarta Sans', sans-serif; color: #2A1A14; cursor: pointer">−</button>
            <span style="width: 32px; text-align: center; font-size: 17px; font-weight: 800">{{st.rooms}}</span>
            <button aria-label="{{st.roomsUpAria}}" sc-camel-on-click="{{st.roomsUp}}" style="width: 44px; height: 44px; border: none; background: transparent; font: 700 20px 'Plus Jakarta Sans', sans-serif; color: #2A1A14; cursor: pointer">+</button>
          </div>
        </div>
        <div style="display: flex; align-items: flex-start; gap: 10px">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7A1F2B" stroke-width="1.8" stroke-linecap="round" aria-hidden="true" style="flex: none; margin-top: 2px"><path d="M12 21s7-6 7-12a7 7 0 0 0-14 0c0 6 7 12 7 12z"></path><circle cx="12" cy="9" r="2.5"></circle></svg>
          <span style="flex: 1; display: flex; flex-direction: column; gap: 4px"><span style="font-size: 14px; color: #4F4036">{{st.address}}</span><a href="#" style="font-size: 14px; font-weight: 700">Open in Maps</a></span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px">
          <span style="font-size: 15px; font-weight: 700">Guests staying here ({{st.guestCount}})</span>
          <div style="border: 1px solid #F1E7D6; border-radius: 12px; display: flex; flex-direction: column">
            <sc-for list="{{st.guests}}" as="gu" hint-placeholder-count="3">
              <div style="display: flex; align-items: center; gap: 8px; padding: 6px 6px 6px 12px; min-height: 52px; border-bottom: 1px solid #F1E7D6">
                <sc-if value="{{gu.viewing}}" hint-placeholder-val="{{ true }}">
                  <span style="width: 32px; height: 32px; border-radius: 16px; background: #E4EDE0; color: #2F5D3A; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; flex: none">{{gu.initial}}</span>
                  <span style="flex: 1; font-size: 15px; font-weight: 600">{{gu.name}}</span>
                  <button sc-camel-on-click="{{gu.edit}}" aria-label="{{gu.editAria}}" style="width: 40px; height: 40px; border-radius: 10px; border: 1px solid #E9DCC4; background: #FFFFFF; display: flex; align-items: center; justify-content: center; cursor: pointer"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#4F4036" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z"></path><path d="M13 7l4 4"></path></svg></button>
                  <button sc-camel-on-click="{{gu.remove}}" aria-label="{{gu.removeAria}}" style="width: 40px; height: 40px; border-radius: 10px; border: 1px solid #E9DCC4; background: #FFFFFF; display: flex; align-items: center; justify-content: center; cursor: pointer"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#7A1F2B" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"></path><path d="M10 11v6M14 11v6"></path></svg></button>
                </sc-if>
                <sc-if value="{{gu.editing}}" hint-placeholder-val="{{ false }}">
                  <input aria-label="Edit guest name" value="{{gu.editValue}}" sc-camel-on-change="{{gu.setEdit}}" style="flex: 1; min-width: 0; height: 40px; border-radius: 10px; border: 2px solid #7A1F2B; background: #FFFFFF; padding: 0 10px; font: 600 15px 'Plus Jakarta Sans', sans-serif; color: #2A1A14">
                  <button sc-camel-on-click="{{gu.save}}" style="height: 40px; padding: 0 12px; border-radius: 10px; border: none; background: #7A1F2B; color: #FFFFFF; font: 700 14px 'Plus Jakarta Sans', sans-serif; cursor: pointer">Save</button>
                </sc-if>
              </div>
            </sc-for>
            <div style="display: flex; gap: 8px; padding: 8px">
              <input aria-label="{{st.addAria}}" value="{{st.draft}}" sc-camel-on-change="{{st.setDraft}}" placeholder="Add a guest name" style="flex: 1; min-width: 0; height: 44px; border-radius: 10px; border: 1px solid #D9C9AC; background: #FFFFFF; padding: 0 10px; font: 500 14px 'Plus Jakarta Sans', sans-serif; color: #2A1A14">
              <button sc-camel-on-click="{{st.addGuest}}" style="height: 44px; padding: 0 12px; border-radius: 10px; border: 1.5px solid #7A1F2B; background: #FFFFFF; font: 700 14px 'Plus Jakarta Sans', sans-serif; color: #7A1F2B; cursor: pointer">+ Add</button>
            </div>
          </div>
        </div>
        <button sc-camel-on-click="{{st.share}}" style="min-height: 50px; border-radius: 25px; border: none; background: #1E6B45; color: #FFFFFF; font: 700 15px 'Plus Jakarta Sans', sans-serif; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20l1.3-4A8 8 0 1 1 8 19z"></path><path d="M9 9.5c.3 2 2 4 4.5 5l1.2-1.2 1.8.8"></path></svg>Share location on WhatsApp</button>
        <button sc-camel-on-click="{{st.askDelete}}" style="min-height: 48px; border-radius: 24px; border: 1.5px solid #D9C9AC; background: #FFFFFF; color: #7A1F2B; font: 700 15px 'Plus Jakarta Sans', sans-serif; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7A1F2B" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"></path><path d="M10 11v6M14 11v6"></path></svg>Delete this stay</button>
      </div>
    </sc-for>
  </div>
  <sc-if value="{{sharing}}" hint-placeholder-val="{{ false }}">
    <div style="position: absolute; inset: 0; background: rgba(42,26,20,0.55); display: flex; flex-direction: column; justify-content: flex-start; padding: 110px 16px 0; z-index: 10">
      <div role="dialog" aria-label="Share on WhatsApp" style="background: #FBF6EC; border-radius: 24px; border: 2px solid #C99A2E; padding: 20px; display: flex; flex-direction: column; gap: 14px">
        <h2 style="margin: 0; font-size: 22px">Share on WhatsApp</h2>
        <span style="font-size: 14px; color: #4F4036">This message will open in WhatsApp. Pick the family group or a person to send it to.</span>
        <span style="font-size: 13px; font-weight: 700; color: #6B5A4E">Message preview · tap the contact lines to fill them in</span>
        <div style="background: #E4EDE0; border-radius: 16px 16px 16px 4px; padding: 14px; font-size: 14px; line-height: 1.55; color: #2A1A14; display: flex; flex-direction: column; gap: 6px">
          <span style="white-space: pre-line">{{shareTop}}</span>
          <label style="display: flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 600">Contact person:
            <input value="{{contactName}}" sc-camel-on-change="{{setContactName}}" placeholder="add name" style="flex: 1; min-width: 0; height: 36px; border: none; border-bottom: 2px dashed #2F5D3A; background: rgba(255,255,255,0.6); border-radius: 6px 6px 0 0; padding: 0 8px; font: 600 14px 'Plus Jakarta Sans', sans-serif; color: #2A1A14">
          </label>
          <label style="display: flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 600">Contact number:
            <input type="tel" inputmode="tel" value="{{contactPhone}}" sc-camel-on-change="{{setContactPhone}}" placeholder="add number" style="flex: 1; min-width: 0; height: 36px; border: none; border-bottom: 2px dashed #2F5D3A; background: rgba(255,255,255,0.6); border-radius: 6px 6px 0 0; padding: 0 8px; font: 600 14px 'Plus Jakarta Sans', sans-serif; color: #2A1A14">
          </label>
          <span>Map: [Google Maps link]</span>
        </div>
        <a href="#" style="min-height: 52px; border-radius: 26px; background: #1E6B45; color: #FFFFFF; font-size: 16px; font-weight: 700; display: flex; align-items: center; justify-content: center; text-decoration: none">Open WhatsApp</a>
        <button sc-camel-on-click="{{closeShare}}" style="min-height: 48px; border-radius: 24px; border: 1.5px solid #D9C9AC; background: #FFFFFF; font: 700 15px 'Plus Jakarta Sans', sans-serif; color: #2A1A14; cursor: pointer">Cancel</button>
      </div>
    </div>
  </sc-if>
  <sc-if value="{{confirming}}" hint-placeholder-val="{{ false }}">
    <div style="position: absolute; inset: 0; background: rgba(42,26,20,0.55); display: flex; flex-direction: column; justify-content: flex-start; padding: 220px 16px 0; z-index: 10">
      <div role="alertdialog" aria-label="Delete stay" style="background: #FBF6EC; border-radius: 24px; border: 2px solid #C99A2E; padding: 20px; display: flex; flex-direction: column; gap: 14px">
        <h2 style="margin: 0; font-size: 22px">Delete this stay?</h2>
        <span style="font-size: 15px; line-height: 1.5; color: #4F4036">{{confirmText}}</span>
        <button sc-camel-on-click="{{doDelete}}" style="min-height: 52px; border-radius: 26px; border: none; background: #7A1F2B; color: #FFFFFF; font: 700 16px 'Plus Jakarta Sans', sans-serif; cursor: pointer">Yes, delete</button>
        <button sc-camel-on-click="{{cancelDelete}}" style="min-height: 48px; border-radius: 24px; border: 1.5px solid #D9C9AC; background: #FFFFFF; font: 700 15px 'Plus Jakarta Sans', sans-serif; color: #2A1A14; cursor: pointer">Keep it</button>
      </div>
    </div>
  </sc-if>
  <sc-if value="{{empty}}" hint-placeholder-val="{{ false }}">
    <div style="position: absolute; left: 20px; right: 20px; top: 420px; border: 2px dashed #D9C9AC; border-radius: 16px; padding: 18px; text-align: center; font-size: 15px; color: #6B5A4E">No stays yet. Tap “+ Add a stay” to add the first place.</div>
  </sc-if>
  <!-- bottom tab bar: built already -->
</div>
```


## Screen 3.4 · Add a stay

```html
<div style="width: 390px; height: 1620px; background: #FBF6EC; position: relative; overflow: hidden; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; color: #2A1A14">
  <div aria-hidden="true" style="height: 14px; background: radial-gradient(circle, #C99A2E 1.7px, transparent 2.2px) 0 0 / 14px 14px, #7A1F2B; border-bottom: 2px solid #C99A2E"></div>
  <div style="padding: 12px 20px 24px; height: 1604px; box-sizing: border-box; display: flex; flex-direction: column; gap: 22px">
    <a href="Stays.dc.html" style="align-self: flex-start; display: flex; align-items: center; gap: 6px; min-height: 44px; padding: 0 16px 0 10px; border-radius: 22px; background: #FFFFFF; border: 1px solid #E9DCC4; text-decoration: none; color: #2A1A14; font-size: 15px; font-weight: 700"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"></path></svg>Cancel</a>
    <div style="display: flex; flex-direction: column; gap: 6px">
      <h1 style="margin: 0; font-size: 28px">Add a stay</h1>
      <span style="font-size: 14px; color: #6B5A4E">One stay = one place and its dates. Booking in several places? Add each one separately.</span>
    </div>
    <label style="display: flex; flex-direction: column; gap: 8px; font-size: 15px; font-weight: 700">Place name
      <input placeholder="e.g. Hotel near the venue" style="height: 52px; border-radius: 12px; border: 1px solid #D9C9AC; background: #FFFFFF; padding: 0 16px; font: 500 16px 'Plus Jakarta Sans', sans-serif; color: #2A1A14">
    </label>
    <div style="display: flex; flex-direction: column; gap: 8px">
      <span style="font-size: 15px; font-weight: 700">Location</span>
      <input aria-label="Address" placeholder="Full address" style="height: 52px; border-radius: 12px; border: 1px solid #D9C9AC; background: #FFFFFF; padding: 0 16px; font: 500 16px 'Plus Jakarta Sans', sans-serif; color: #2A1A14">
      <div style="display: flex; align-items: center; height: 52px; border-radius: 12px; border: 1px solid #D9C9AC; background: #FFFFFF; padding: 0 14px; gap: 10px">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7A1F2B" stroke-width="1.8" stroke-linecap="round" aria-hidden="true" style="flex: none"><path d="M12 21s7-6 7-12a7 7 0 0 0-14 0c0 6 7 12 7 12z"></path><circle cx="12" cy="9" r="2.5"></circle></svg>
        <input aria-label="Google Maps link" placeholder="Paste Google Maps link (for sharing)" style="flex: 1; min-width: 0; border: none; outline: none; background: transparent; font: 500 15px 'Plus Jakarta Sans', sans-serif; color: #2A1A14">
      </div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 8px">
      <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 8px">
        <span style="font-size: 15px; font-weight: 700">Dates</span>
        <span style="font-size: 14px; font-weight: 700; color: #7A1F2B; text-align: right">{{rangeLabel}}</span>
      </div>
      <span style="font-size: 13px; color: #6B5A4E">{{rangeHint}}</span>
      <div style="background: #FFFFFF; border: 1px solid #E9DCC4; border-radius: 16px; padding: 12px; display: flex; flex-direction: column; gap: 8px">
        <div style="display: flex; align-items: center; justify-content: space-between">
          <button aria-label="Previous month" sc-camel-on-click="{{prevMonth}}" style="width: 44px; height: 44px; border-radius: 22px; border: none; background: #FBF6EC; display: flex; align-items: center; justify-content: center; cursor: pointer"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2A1A14" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"></path></svg></button>
          <span style="font-size: 16px; font-weight: 700">{{monthLabel}}</span>
          <button aria-label="Next month" sc-camel-on-click="{{nextMonth}}" style="width: 44px; height: 44px; border-radius: 22px; border: none; background: #FBF6EC; display: flex; align-items: center; justify-content: center; cursor: pointer"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2A1A14" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M9 5l7 7-7 7"></path></svg></button>
        </div>
        <div style="display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 4px; text-align: center; font-size: 12px; font-weight: 700; color: #6B5A4E">
          <span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span><span>Su</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 4px 0">
          <sc-for list="{{cells}}" as="c" hint-placeholder-count="35">
            <button sc-camel-on-click="{{c.pick}}" disabled="{{c.blank}}" aria-label="{{c.aria}}" style="{{c.style}}">{{c.label}}</button>
          </sc-for>
        </div>
      </div>
    </div>
    <div style="display: flex; align-items: center; justify-content: space-between">
      <span style="display: flex; flex-direction: column; gap: 2px"><span style="font-size: 15px; font-weight: 700">How many rooms?</span><span style="font-size: 13px; color: #6B5A4E">{{roomHint}}</span></span>
      <div style="display: flex; align-items: center; border-radius: 12px; border: 1px solid #D9C9AC; background: #FFFFFF">
        <button aria-label="Fewer rooms" sc-camel-on-click="{{roomsDown}}" style="width: 48px; height: 48px; border: none; background: transparent; font: 700 22px 'Plus Jakarta Sans', sans-serif; color: #2A1A14; cursor: pointer">−</button>
        <span style="width: 36px; text-align: center; font-size: 18px; font-weight: 800">{{rooms}}</span>
        <button aria-label="More rooms" sc-camel-on-click="{{roomsUp}}" style="width: 48px; height: 48px; border: none; background: transparent; font: 700 22px 'Plus Jakarta Sans', sans-serif; color: #2A1A14; cursor: pointer">+</button>
      </div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 10px">
      <span style="display: flex; justify-content: space-between; align-items: baseline"><span style="font-size: 15px; font-weight: 700">Who is staying here?</span><span style="font-size: 13px; color: #6B5A4E">{{pickedLabel}}</span></span>
      <span style="font-size: 13px; color: #6B5A4E">Tap to choose everyone staying at this place.</span>
      <div style="display: flex; flex-wrap: wrap; gap: 8px">
        <sc-for list="{{people}}" as="p" hint-placeholder-count="6">
          <span style="{{p.wrapStyle}}">
            <button sc-camel-on-click="{{p.pick}}" aria-pressed="{{p.pressed}}" style="{{p.style}}">{{p.label}}</button>
            <button sc-camel-on-click="{{p.remove}}" aria-label="{{p.removeAria}}" style="{{p.xStyle}}">×</button>
          </span>
        </sc-for>
      </div>
      <div style="display: flex; gap: 8px">
        <input aria-label="Add a new guest name" value="{{draft}}" sc-camel-on-change="{{setDraft}}" placeholder="Add a guest name" style="flex: 1; min-width: 0; height: 48px; border-radius: 12px; border: 1px solid #D9C9AC; background: #FFFFFF; padding: 0 14px; font: 500 15px 'Plus Jakarta Sans', sans-serif; color: #2A1A14">
        <button sc-camel-on-click="{{addName}}" style="height: 48px; padding: 0 16px; border-radius: 12px; border: 1.5px solid #7A1F2B; background: #FFFFFF; font: 700 15px 'Plus Jakarta Sans', sans-serif; color: #7A1F2B; cursor: pointer">+ Add</button>
      </div>
    </div>
    <a href="Stays.dc.html" style="margin-top: auto; min-height: 56px; border-radius: 28px; background: #7A1F2B; color: #FFFFFF; font-size: 17px; font-weight: 700; display: flex; align-items: center; justify-content: center; text-decoration: none">Save stay</a>
  </div>
</div>
```


## Screen 4.1 · Shopping

```html
<div style="width: 390px; height: 1320px; background: #FBF6EC; position: relative; overflow: hidden; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; color: #2A1A14">
  <div aria-hidden="true" style="height: 14px; background: radial-gradient(circle, #C99A2E 1.7px, transparent 2.2px) 0 0 / 14px 14px, #7A1F2B; border-bottom: 2px solid #C99A2E"></div>
  <div style="padding: 12px 20px 100px; display: flex; flex-direction: column; gap: 18px">
    <a href="Main.dc.html" style="align-self: flex-start; display: flex; align-items: center; gap: 6px; min-height: 44px; padding: 0 16px 0 10px; border-radius: 22px; background: #FFFFFF; border: 1px solid #E9DCC4; text-decoration: none; color: #2A1A14; font-size: 15px; font-weight: 700"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"></path></svg>Home</a>
    <h1 style="margin: 0; font-size: 28px">Clothing &amp; shopping</h1>
    <div style="display: flex; flex-direction: column; gap: 8px">
      <span style="font-size: 14px; font-weight: 700; color: #4F4036">Show</span>
      <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px">
        <button sc-camel-on-click="{{showAll}}" style="{{allStyle}}">All events</button>
        <button sc-camel-on-click="{{showMehandi}}" style="{{mehandiStyle}}">Mehandi</button>
        <button sc-camel-on-click="{{showHaldi}}" style="{{haldiStyle}}">Haldi</button>
      </div>
    </div>
    <div style="background: #FFFFFF; border: 1px solid #E9DCC4; border-radius: 16px; padding: 16px; display: flex; flex-direction: column; gap: 12px">
      <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px">
        <span style="display: flex; flex-direction: column; gap: 2px"><span style="font-size: 12px; font-weight: 600; color: #6B5A4E">Total cost</span><span style="font-size: 18px; font-weight: 800">{{total}}</span></span>
        <span style="display: flex; flex-direction: column; gap: 2px"><span style="font-size: 12px; font-weight: 600; color: #6B5A4E">Already bought</span><span style="font-size: 18px; font-weight: 800; color: #2F5D3A">{{spent}}</span></span>
        <span style="display: flex; flex-direction: column; gap: 2px"><span style="font-size: 12px; font-weight: 600; color: #6B5A4E">Items to buy</span><span style="font-size: 18px; font-weight: 800">{{toBuyCount}}</span></span>
      </div>
      <div style="height: 8px; background: #F1E7D6; border-radius: 4px; overflow: hidden"><div style="{{barStyle}}"></div></div>
      <span style="font-size: 13px; color: #6B5A4E">{{progressLabel}}</span>
    </div>
    <sc-if value="{{hasToBuy}}" hint-placeholder-val="{{ true }}">
      <div style="background: #FFFFFF; border: 1px solid #E9DCC4; border-radius: 16px; display: flex; flex-direction: column">
        <sc-for list="{{toBuy}}" as="it" hint-placeholder-count="2">
          <div style="display: flex; align-items: center; gap: 12px; padding: 12px 12px 12px 16px; min-height: 64px; border-bottom: 1px solid #F1E7D6">
            <button sc-camel-on-click="{{it.toggle}}" aria-label="{{it.aria}}" aria-pressed="false" style="width: 28px; height: 28px; border-radius: 8px; border: 2px solid #B9A684; background: #FFFFFF; flex: none; cursor: pointer"></button>
            <span style="flex: 1; display: flex; flex-direction: column; gap: 2px"><span style="font-size: 16px; font-weight: 700">{{it.name}}</span><span style="font-size: 13px; color: #6B5A4E">For {{it.who}} · {{it.event}}</span></span>
            <span style="font-size: 16px; font-weight: 700">{{it.price}}</span>
            <button aria-label="{{it.editAria}}" style="width: 40px; height: 40px; border-radius: 10px; border: 1px solid #E9DCC4; background: #FFFFFF; display: flex; align-items: center; justify-content: center; flex: none"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7A1F2B" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"></path><path d="M10 11v6M14 11v6"></path></svg></button>
          </div>
        </sc-for>
      </div>
    </sc-if>
    <sc-if value="{{noneToBuy}}" hint-placeholder-val="{{ false }}">
      <div style="border: 2px dashed #D9C9AC; border-radius: 16px; padding: 18px; text-align: center; font-size: 15px; color: #6B5A4E">{{emptyLabel}}</div>
    </sc-if>
    <div style="display: flex; flex-direction: column; gap: 8px">
      <button sc-camel-on-click="{{toggleBought}}" aria-expanded="{{boughtOpenStr}}" style="min-height: 48px; border-radius: 14px; border: 1px solid #E9DCC4; background: #FFFFFF; text-align: left; padding: 0 16px; display: flex; align-items: center; justify-content: space-between; font: 600 15px 'Plus Jakarta Sans', sans-serif; color: #4F4036; cursor: pointer">Already bought ({{boughtCount}})<span aria-hidden="true">{{chevron}}</span></button>
      <sc-if value="{{boughtOpen}}" hint-placeholder-val="{{ false }}">
        <div style="background: #FFFFFF; border: 1px solid #E9DCC4; border-radius: 16px; display: flex; flex-direction: column">
          <sc-for list="{{bought}}" as="b" hint-placeholder-count="1">
            <div style="display: flex; align-items: center; gap: 12px; padding: 12px 16px; min-height: 56px; border-bottom: 1px solid #F1E7D6">
              <button sc-camel-on-click="{{b.toggle}}" aria-label="{{b.aria}}" aria-pressed="true" style="width: 28px; height: 28px; border-radius: 8px; border: none; background: #2F5D3A; color: #FFFFFF; font: 800 15px 'Plus Jakarta Sans', sans-serif; flex: none; cursor: pointer">✓</button>
              <span style="flex: 1; font-size: 15px; color: #6B5A4E; text-decoration: line-through">{{b.name}} · For {{b.who}}</span>
              <span style="font-size: 15px; color: #6B5A4E">{{b.price}}</span>
            </div>
          </sc-for>
        </div>
      </sc-if>
    </div>
    <div style="display: flex; flex-direction: column; gap: 8px">
      <button sc-camel-on-click="{{toggleEdit}}" aria-expanded="{{editOpenStr}}" style="min-height: 48px; border-radius: 14px; border: 1px solid #E9DCC4; background: #FFFFFF; text-align: left; padding: 0 16px; display: flex; align-items: center; justify-content: space-between; font: 600 15px 'Plus Jakarta Sans', sans-serif; color: #4F4036; cursor: pointer">Edit details<span aria-hidden="true">{{editChevron}}</span></button>
      <sc-if value="{{editOpen}}" hint-placeholder-val="{{ false }}">
        <div style="background: #FFFFFF; border: 1px solid #E9DCC4; border-radius: 16px; padding: 12px; display: flex; flex-direction: column; gap: 12px">
          <span style="font-size: 13px; color: #6B5A4E">Change anything in the table, then save. Swipe sideways to see all columns.</span>
          <div style="overflow-x: auto">
            <sc-raw-table style="border-collapse: collapse; min-width: 560px">
              <sc-raw-thead><sc-raw-tr><sc-raw-th style="text-align: left; padding: 0 6px 8px; font-size: 12px; font-weight: 700; color: #6B5A4E">Event</sc-raw-th><sc-raw-th style="text-align: left; padding: 0 6px 8px; font-size: 12px; font-weight: 700; color: #6B5A4E">Person</sc-raw-th><sc-raw-th style="text-align: left; padding: 0 6px 8px; font-size: 12px; font-weight: 700; color: #6B5A4E">Item</sc-raw-th><sc-raw-th style="text-align: left; padding: 0 6px 8px; font-size: 12px; font-weight: 700; color: #6B5A4E">Price (₹)</sc-raw-th><sc-raw-th style="text-align: left; padding: 0 6px 8px; font-size: 12px; font-weight: 700; color: #6B5A4E">Status</sc-raw-th></sc-raw-tr></sc-raw-thead>
              <sc-raw-tbody>
                <sc-raw-tr>
                  <sc-raw-td style="padding: 4px"><sc-raw-select aria-label="Event for Sarees" sc-camel-default-value="Haldi" style="height: 44px; width: 100%; box-sizing: border-box; border-radius: 8px; border: 1px solid #D9C9AC; background: #FFFFFF; padding: 0 8px; font: 500 14px 'Plus Jakarta Sans', sans-serif; color: #2A1A14"><option>Mehandi</option><option>Haldi</option></sc-raw-select></sc-raw-td>
                  <sc-raw-td style="padding: 4px"><sc-raw-select aria-label="Person for Sarees" sc-camel-default-value="Anand" style="height: 44px; width: 100%; box-sizing: border-box; border-radius: 8px; border: 1px solid #D9C9AC; background: #FFFFFF; padding: 0 8px; font: 500 14px 'Plus Jakarta Sans', sans-serif; color: #2A1A14"><option>Anand</option><option>Soundarya</option></sc-raw-select></sc-raw-td>
                  <sc-raw-td style="padding: 4px"><input aria-label="Item name" sc-camel-default-value="Sarees" style="height: 44px; width: 100%; box-sizing: border-box; border-radius: 8px; border: 1px solid #D9C9AC; background: #FFFFFF; padding: 0 8px; font: 500 14px 'Plus Jakarta Sans', sans-serif; color: #2A1A14"></sc-raw-td>
                  <sc-raw-td style="padding: 4px"><input aria-label="Price of Sarees" sc-camel-default-value="10000" inputmode="numeric" style="height: 44px; width: 100%; box-sizing: border-box; border-radius: 8px; border: 1px solid #D9C9AC; background: #FFFFFF; padding: 0 8px; font: 500 14px 'Plus Jakarta Sans', sans-serif; color: #2A1A14; text-align: right"></sc-raw-td>
                  <sc-raw-td style="padding: 4px"><sc-raw-select aria-label="Status of Sarees" sc-camel-default-value="to buy" style="height: 44px; width: 100%; box-sizing: border-box; border-radius: 8px; border: 1px solid #D9C9AC; background: #FFFFFF; padding: 0 8px; font: 500 14px 'Plus Jakarta Sans', sans-serif; color: #2A1A14"><option>to buy</option><option>bought</option></sc-raw-select></sc-raw-td>
                </sc-raw-tr>
                <sc-raw-tr>
                  <sc-raw-td style="padding: 4px"><sc-raw-select aria-label="Event for Kurta" sc-camel-default-value="Haldi" style="height: 44px; width: 100%; box-sizing: border-box; border-radius: 8px; border: 1px solid #D9C9AC; background: #FFFFFF; padding: 0 8px; font: 500 14px 'Plus Jakarta Sans', sans-serif; color: #2A1A14"><option>Mehandi</option><option>Haldi</option></sc-raw-select></sc-raw-td>
                  <sc-raw-td style="padding: 4px"><sc-raw-select aria-label="Person for Kurta" sc-camel-default-value="Anand" style="height: 44px; width: 100%; box-sizing: border-box; border-radius: 8px; border: 1px solid #D9C9AC; background: #FFFFFF; padding: 0 8px; font: 500 14px 'Plus Jakarta Sans', sans-serif; color: #2A1A14"><option>Anand</option><option>Soundarya</option></sc-raw-select></sc-raw-td>
                  <sc-raw-td style="padding: 4px"><input aria-label="Item name" sc-camel-default-value="Kurta" style="height: 44px; width: 100%; box-sizing: border-box; border-radius: 8px; border: 1px solid #D9C9AC; background: #FFFFFF; padding: 0 8px; font: 500 14px 'Plus Jakarta Sans', sans-serif; color: #2A1A14"></sc-raw-td>
                  <sc-raw-td style="padding: 4px"><input aria-label="Price of Kurta" sc-camel-default-value="5000" inputmode="numeric" style="height: 44px; width: 100%; box-sizing: border-box; border-radius: 8px; border: 1px solid #D9C9AC; background: #FFFFFF; padding: 0 8px; font: 500 14px 'Plus Jakarta Sans', sans-serif; color: #2A1A14; text-align: right"></sc-raw-td>
                  <sc-raw-td style="padding: 4px"><sc-raw-select aria-label="Status of Kurta" sc-camel-default-value="to buy" style="height: 44px; width: 100%; box-sizing: border-box; border-radius: 8px; border: 1px solid #D9C9AC; background: #FFFFFF; padding: 0 8px; font: 500 14px 'Plus Jakarta Sans', sans-serif; color: #2A1A14"><option>to buy</option><option>bought</option></sc-raw-select></sc-raw-td>
                </sc-raw-tr>
              </sc-raw-tbody>
            </sc-raw-table>
          </div>
          <button sc-camel-on-click="{{toggleEdit}}" style="min-height: 48px; border-radius: 24px; border: 1.5px solid #7A1F2B; background: #FFFFFF; font: 700 15px 'Plus Jakarta Sans', sans-serif; color: #7A1F2B; cursor: pointer">Save changes</button>
        </div>
      </sc-if>
    </div>
    <a href="AddItem.dc.html" style="min-height: 52px; border-radius: 26px; background: #7A1F2B; color: #FFFFFF; font-size: 16px; font-weight: 700; display: flex; align-items: center; justify-content: center; text-decoration: none">+ Add an item</a>
  </div>
  <!-- bottom tab bar: built already -->
</div>
```


## Screen 4.2 · Add a shopping item

```html
<div style="width: 390px; height: 1060px; background: #FBF6EC; position: relative; overflow: hidden; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; color: #2A1A14">
  <div aria-hidden="true" style="height: 14px; background: radial-gradient(circle, #C99A2E 1.7px, transparent 2.2px) 0 0 / 14px 14px, #7A1F2B; border-bottom: 2px solid #C99A2E"></div>
  <div style="padding: 12px 20px 24px; height: 1044px; box-sizing: border-box; display: flex; flex-direction: column; gap: 22px">
    <a href="Shopping.dc.html" style="align-self: flex-start; display: flex; align-items: center; gap: 6px; min-height: 44px; padding: 0 16px 0 10px; border-radius: 22px; background: #FFFFFF; border: 1px solid #E9DCC4; text-decoration: none; color: #2A1A14; font-size: 15px; font-weight: 700"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"></path></svg>Cancel</a>
    <h1 style="margin: 0; font-size: 28px">Add a shopping item</h1>
    <label style="display: flex; flex-direction: column; gap: 8px; font-size: 15px; font-weight: 700">What to buy?
      <input placeholder="e.g. Silk saree, veshti, sherwani" style="height: 52px; border-radius: 12px; border: 1px solid #D9C9AC; background: #FFFFFF; padding: 0 16px; font: 500 16px 'Plus Jakarta Sans', sans-serif; color: #2A1A14">
    </label>
    <div style="display: flex; flex-direction: column; gap: 8px">
      <span style="font-size: 15px; font-weight: 700">For which event?</span>
      <div style="display: flex; gap: 10px">
        <button aria-pressed="true" style="flex: 1; min-height: 52px; border-radius: 12px; border: 2px solid #7A1F2B; background: #F7E4E1; font: 700 16px 'Plus Jakarta Sans', sans-serif; color: #7A1F2B">Mehandi</button>
        <button aria-pressed="false" style="flex: 1; min-height: 52px; border-radius: 12px; border: 1px solid #D9C9AC; background: #FFFFFF; font: 600 16px 'Plus Jakarta Sans', sans-serif; color: #2A1A14">Haldi</button>
      </div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 10px">
      <span style="display: flex; justify-content: space-between; align-items: baseline"><span style="font-size: 15px; font-weight: 700">Who is it for?</span><span style="font-size: 13px; color: #6B5A4E">{{countLabel}}</span></span>
      <div style="display: flex; flex-wrap: wrap; gap: 8px">
        <sc-for list="{{people}}" as="p" hint-placeholder-count="2">
          <span style="{{p.wrapStyle}}">
            <button sc-camel-on-click="{{p.pick}}" aria-pressed="{{p.pressed}}" style="{{p.style}}">{{p.label}}</button>
            <button sc-camel-on-click="{{p.remove}}" aria-label="{{p.removeAria}}" style="{{p.xStyle}}">×</button>
          </span>
        </sc-for>
      </div>
      <div style="display: flex; gap: 8px">
        <input aria-label="Add a new name" value="{{draft}}" sc-camel-on-change="{{setDraft}}" placeholder="Add a new name, e.g. Amma" style="flex: 1; min-width: 0; height: 48px; border-radius: 12px; border: 1px solid #D9C9AC; background: #FFFFFF; padding: 0 14px; font: 500 15px 'Plus Jakarta Sans', sans-serif; color: #2A1A14">
        <button sc-camel-on-click="{{addName}}" style="height: 48px; padding: 0 16px; border-radius: 12px; border: 1.5px solid #7A1F2B; background: #FFFFFF; font: 700 15px 'Plus Jakarta Sans', sans-serif; color: #7A1F2B; cursor: pointer">+ Add</button>
      </div>
    </div>
    <label style="display: flex; flex-direction: column; gap: 8px; font-size: 15px; font-weight: 700">Price
      <span style="display: flex; align-items: center; height: 52px; border-radius: 12px; border: 1px solid #D9C9AC; background: #FFFFFF; padding: 0 16px; gap: 6px"><span style="font-size: 16px; font-weight: 700; color: #6B5A4E">₹</span><input placeholder="0" inputmode="numeric" style="flex: 1; min-width: 0; border: none; outline: none; background: transparent; font: 600 16px 'Plus Jakarta Sans', sans-serif; color: #2A1A14"></span>
    </label>
    <div style="display: flex; flex-direction: column; gap: 8px">
      <span style="font-size: 15px; font-weight: 700">Status</span>
      <div style="display: flex; gap: 10px">
        <button aria-pressed="true" style="flex: 1; min-height: 52px; border-radius: 12px; border: 2px solid #7A1F2B; background: #F7E4E1; font: 700 16px 'Plus Jakarta Sans', sans-serif; color: #7A1F2B">To buy</button>
        <button aria-pressed="false" style="flex: 1; min-height: 52px; border-radius: 12px; border: 1px solid #D9C9AC; background: #FFFFFF; font: 600 16px 'Plus Jakarta Sans', sans-serif; color: #2A1A14">Already bought</button>
      </div>
    </div>
    <a href="Shopping.dc.html" style="margin-top: auto; min-height: 56px; border-radius: 28px; background: #7A1F2B; color: #FFFFFF; font-size: 17px; font-weight: 700; display: flex; align-items: center; justify-content: center; text-decoration: none">Add item</a>
  </div>
</div>
```


## Screen 4.3 · Budget

```html
<div style="width: 390px; height: 1140px; background: #FBF6EC; position: relative; overflow: hidden; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; color: #2A1A14">
  <div aria-hidden="true" style="height: 14px; background: radial-gradient(circle, #C99A2E 1.7px, transparent 2.2px) 0 0 / 14px 14px, #7A1F2B; border-bottom: 2px solid #C99A2E"></div>
  <div style="padding: 12px 20px 100px; display: flex; flex-direction: column; gap: 18px">
    <a href="Main.dc.html" style="align-self: flex-start; display: flex; align-items: center; gap: 6px; min-height: 44px; padding: 0 16px 0 10px; border-radius: 22px; background: #FFFFFF; border: 1px solid #E9DCC4; text-decoration: none; color: #2A1A14; font-size: 15px; font-weight: 700"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"></path></svg>Home</a>
    <h1 style="margin: 0; font-size: 28px">Budget</h1>
    <div style="background: #7A1F2B; color: #FFFFFF; border-radius: 18px; padding: 18px; border: 2px solid #C99A2E; display: flex; flex-direction: column; gap: 14px">
      <div style="display: flex; flex-direction: column; gap: 2px">
        <span style="font-size: 13px; font-weight: 600; color: #F1DDB0">Budget limit</span>
        <span style="font-size: 30px; font-weight: 800">₹25,00,000</span>
      </div>
      <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px">
        <span style="display: flex; flex-direction: column; gap: 2px"><span style="font-size: 12px; color: #F1DDB0">Committed</span><span style="font-size: 16px; font-weight: 700">₹15,000</span></span>
        <span style="display: flex; flex-direction: column; gap: 2px"><span style="font-size: 12px; color: #F1DDB0">Paid so far</span><span style="font-size: 16px; font-weight: 700">₹0</span></span>
        <span style="display: flex; flex-direction: column; gap: 2px"><span style="font-size: 12px; color: #F1DDB0">Left</span><span style="font-size: 16px; font-weight: 700">₹24,85,000</span></span>
      </div>
      <div style="display: flex; flex-direction: column; gap: 6px">
        <div style="height: 8px; background: rgba(255,255,255,0.2); border-radius: 4px"><div style="width: 1%; min-width: 6px; height: 8px; border-radius: 4px; background: #C99A2E"></div></div>
        <span style="font-size: 12px; color: #F1DDB0">1% of the limit committed</span>
      </div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 10px">
      <h2 style="margin: 0; font-size: 20px">By event</h2>
      <div style="background: #FFFFFF; border: 1px solid #E9DCC4; border-radius: 16px; display: flex; flex-direction: column">
        <div style="display: flex; align-items: center; padding: 14px 16px; min-height: 52px; border-bottom: 1px solid #F1E7D6">
          <span style="flex: 1; font-size: 16px; font-weight: 600">Whole wedding</span><span style="font-size: 16px; font-weight: 700; color: #6B5A4E">₹0</span>
        </div>
        <div style="display: flex; align-items: center; padding: 14px 16px; min-height: 52px; border-bottom: 1px solid #F1E7D6">
          <span style="flex: 1; font-size: 16px; font-weight: 600">Mehandi</span><span style="font-size: 16px; font-weight: 700; color: #6B5A4E">₹0</span>
        </div>
        <div style="display: flex; align-items: center; padding: 14px 16px; min-height: 52px">
          <span style="flex: 1; display: flex; flex-direction: column; gap: 2px"><span style="font-size: 16px; font-weight: 600">Haldi</span><span style="font-size: 13px; color: #6B5A4E">Shopping ₹15,000 · Other ₹0</span></span><span style="font-size: 16px; font-weight: 700">₹15,000</span>
        </div>
      </div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 10px">
      <h2 style="margin: 0; font-size: 20px">By category</h2>
      <div style="background: #FFFFFF; border: 1px solid #E9DCC4; border-radius: 16px; padding: 14px 16px; display: flex; flex-direction: column; gap: 8px">
        <div style="display: flex; justify-content: space-between; font-size: 16px"><span style="font-weight: 600">Clothing &amp; shopping</span><span style="font-weight: 700">₹15,000</span></div>
        <div style="height: 8px; background: #F1E7D6; border-radius: 4px"><div style="width: 100%; height: 8px; border-radius: 4px; background: #C99A2E"></div></div>
        <span style="font-size: 13px; color: #6B5A4E">Counted from the Shopping list</span>
      </div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 10px">
      <h2 style="margin: 0; font-size: 20px">Expenses</h2>
      <div style="border: 2px dashed #D9C9AC; border-radius: 16px; padding: 18px; display: flex; flex-direction: column; gap: 4px; text-align: center">
        <span style="font-size: 15px; font-weight: 700">No expenses yet</span>
        <span style="font-size: 14px; color: #6B5A4E">Add venue, catering or decor payments here. Shopping is already counted above.</span>
      </div>
    </div>
    <a href="AddExpense.dc.html" style="min-height: 52px; border-radius: 26px; background: #7A1F2B; color: #FFFFFF; font-size: 16px; font-weight: 700; display: flex; align-items: center; justify-content: center; text-decoration: none">+ Add an expense</a>
  </div>
  <!-- bottom tab bar: built already -->
</div>
```


## Screen 4.4 · Add an expense

```html
<div style="width: 390px; height: 1340px; background: #FBF6EC; position: relative; overflow: hidden; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; color: #2A1A14">
  <div aria-hidden="true" style="height: 14px; background: radial-gradient(circle, #C99A2E 1.7px, transparent 2.2px) 0 0 / 14px 14px, #7A1F2B; border-bottom: 2px solid #C99A2E"></div>
  <div style="padding: 12px 20px 24px; height: 1324px; box-sizing: border-box; display: flex; flex-direction: column; gap: 22px">
    <a href="Budget.dc.html" style="align-self: flex-start; display: flex; align-items: center; gap: 6px; min-height: 44px; padding: 0 16px 0 10px; border-radius: 22px; background: #FFFFFF; border: 1px solid #E9DCC4; text-decoration: none; color: #2A1A14; font-size: 15px; font-weight: 700"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"></path></svg>Cancel</a>
    <h1 style="margin: 0; font-size: 28px">Add an expense</h1>
    <label style="display: flex; flex-direction: column; gap: 8px; font-size: 15px; font-weight: 700">What is it for?
      <input placeholder="e.g. Wedding hall booking" style="height: 52px; border-radius: 12px; border: 1px solid #D9C9AC; background: #FFFFFF; padding: 0 16px; font: 500 16px 'Plus Jakarta Sans', sans-serif; color: #2A1A14">
    </label>
    <div style="display: flex; flex-direction: column; gap: 10px">
      <span style="font-size: 15px; font-weight: 700">Category</span>
      <div style="display: flex; flex-wrap: wrap; gap: 8px">
        <sc-for list="{{cats}}" as="c" hint-placeholder-count="5">
          <span style="{{c.wrapStyle}}">
            <button sc-camel-on-click="{{c.pick}}" aria-pressed="{{c.pressed}}" style="{{c.style}}">{{c.label}}</button>
            <button sc-camel-on-click="{{c.remove}}" aria-label="{{c.removeAria}}" style="{{c.xStyle}}">×</button>
          </span>
        </sc-for>
      </div>
      <div style="display: flex; gap: 8px">
        <input aria-label="Add a new category" value="{{catDraft}}" sc-camel-on-change="{{setCatDraft}}" placeholder="Add a new category, e.g. Transport" style="flex: 1; min-width: 0; height: 48px; border-radius: 12px; border: 1px solid #D9C9AC; background: #FFFFFF; padding: 0 14px; font: 500 15px 'Plus Jakarta Sans', sans-serif; color: #2A1A14">
        <button sc-camel-on-click="{{addCat}}" style="height: 48px; padding: 0 16px; border-radius: 12px; border: 1.5px solid #7A1F2B; background: #FFFFFF; font: 700 15px 'Plus Jakarta Sans', sans-serif; color: #7A1F2B; cursor: pointer">+ Add</button>
      </div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 8px">
      <span style="font-size: 15px; font-weight: 700">For which event?</span>
      <div style="display: flex; gap: 8px">
        <sc-for list="{{events}}" as="e" hint-placeholder-count="3">
          <button sc-camel-on-click="{{e.pick}}" aria-pressed="{{e.pressed}}" style="{{e.style}}">{{e.label}}</button>
        </sc-for>
      </div>
    </div>
    <div style="display: flex; gap: 12px">
      <label style="flex: 1; display: flex; flex-direction: column; gap: 8px; font-size: 15px; font-weight: 700">Total amount
        <span style="display: flex; align-items: center; height: 52px; border-radius: 12px; border: 1px solid #D9C9AC; background: #FFFFFF; padding: 0 14px; gap: 6px"><span style="font-size: 16px; font-weight: 700; color: #6B5A4E">₹</span><input placeholder="0" inputmode="numeric" style="flex: 1; min-width: 0; border: none; outline: none; background: transparent; font: 600 16px 'Plus Jakarta Sans', sans-serif; color: #2A1A14"></span>
      </label>
      <label style="flex: 1; display: flex; flex-direction: column; gap: 8px; font-size: 15px; font-weight: 700">Paid so far
        <span style="display: flex; align-items: center; height: 52px; border-radius: 12px; border: 1px solid #D9C9AC; background: #FFFFFF; padding: 0 14px; gap: 6px"><span style="font-size: 16px; font-weight: 700; color: #6B5A4E">₹</span><input placeholder="0" inputmode="numeric" style="flex: 1; min-width: 0; border: none; outline: none; background: transparent; font: 600 16px 'Plus Jakarta Sans', sans-serif; color: #2A1A14"></span>
      </label>
    </div>
    <div style="display: flex; flex-direction: column; gap: 10px">
      <span style="display: flex; justify-content: space-between; align-items: baseline"><span style="font-size: 15px; font-weight: 700">Paid by</span><span style="font-size: 13px; color: #6B5A4E">{{countLabel}}</span></span>
      <div style="display: flex; flex-wrap: wrap; gap: 8px">
        <sc-for list="{{people}}" as="p" hint-placeholder-count="2">
          <span style="{{p.wrapStyle}}">
            <button sc-camel-on-click="{{p.pick}}" aria-pressed="{{p.pressed}}" style="{{p.style}}">{{p.label}}</button>
            <button sc-camel-on-click="{{p.remove}}" aria-label="{{p.removeAria}}" style="{{p.xStyle}}">×</button>
          </span>
        </sc-for>
      </div>
      <div style="display: flex; gap: 8px">
        <input aria-label="Add a new name" value="{{draft}}" sc-camel-on-change="{{setDraft}}" placeholder="Add a new name, e.g. Nanna" style="flex: 1; min-width: 0; height: 48px; border-radius: 12px; border: 1px solid #D9C9AC; background: #FFFFFF; padding: 0 14px; font: 500 15px 'Plus Jakarta Sans', sans-serif; color: #2A1A14">
        <button sc-camel-on-click="{{addName}}" style="height: 48px; padding: 0 16px; border-radius: 12px; border: 1.5px solid #7A1F2B; background: #FFFFFF; font: 700 15px 'Plus Jakarta Sans', sans-serif; color: #7A1F2B; cursor: pointer">+ Add</button>
      </div>
    </div>
    <a href="Budget.dc.html" style="margin-top: auto; min-height: 56px; border-radius: 28px; background: #7A1F2B; color: #FFFFFF; font-size: 17px; font-weight: 700; display: flex; align-items: center; justify-content: center; text-decoration: none">Save expense</a>
  </div>
</div>
```


## Screen 5.1 · Food & menus

```html
<div style="width: 390px; height: 844px; background: #FBF6EC; position: relative; overflow: hidden; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; color: #2A1A14">
  <div aria-hidden="true" style="height: 14px; background: radial-gradient(circle, #C99A2E 1.7px, transparent 2.2px) 0 0 / 14px 14px, #7A1F2B; border-bottom: 2px solid #C99A2E"></div>
  <div style="padding: 12px 20px 100px; display: flex; flex-direction: column; gap: 18px">
    <a href="Main.dc.html" style="align-self: flex-start; display: flex; align-items: center; gap: 6px; min-height: 44px; padding: 0 16px 0 10px; border-radius: 22px; background: #FFFFFF; border: 1px solid #E9DCC4; text-decoration: none; color: #2A1A14; font-size: 15px; font-weight: 700"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"></path></svg>Home</a>
    <h1 style="margin: 0; font-size: 28px">Food &amp; menus</h1>
    <button style="min-height: 48px; border-radius: 12px; border: 1px solid #D9C9AC; background: #FFFFFF; padding: 0 16px; display: flex; align-items: center; justify-content: space-between; font: 600 16px 'Plus Jakarta Sans', sans-serif; color: #2A1A14">Mehandi · 22 Apr<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 9l6 6 6-6"></path></svg></button>
    <div style="background: #F8ECCB; border: 1px solid #E9DCC4; border-radius: 16px; padding: 16px; display: flex; align-items: center; gap: 16px">
      <span style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 72px; height: 72px; border-radius: 36px; background: #FFFFFF; border: 2px solid #C99A2E"><span style="font-size: 26px; font-weight: 800; line-height: 1">2</span><span style="font-size: 11px; font-weight: 600; color: #6E5208">plates</span></span>
      <span style="flex: 1; display: flex; flex-direction: column; gap: 4px"><span style="font-size: 16px; font-weight: 700">Plan food for 2 guests</span><span style="font-size: 13px; color: #4F4036">0 confirmed + 1 not answered, plus 10% extra</span></span>
    </div>
    <div style="display: flex; flex-direction: column; gap: 10px">
      <h2 style="margin: 0; font-size: 20px">Meals</h2>
      <div style="background: #FFFFFF; border: 1px solid #E9DCC4; border-radius: 16px; padding: 16px; display: flex; flex-direction: column; gap: 12px">
        <div style="display: flex; align-items: center; gap: 12px">
          <span style="flex: 1; display: flex; flex-direction: column; gap: 2px"><span style="font-size: 17px; font-weight: 700">Breakfast</span><span style="font-size: 13px; color: #6B5A4E">8:30 AM · For 2 guests · {{dishCount}}</span></span>
          <button aria-label="Meal options" style="width: 44px; height: 44px; border-radius: 12px; border: 1px solid #E9DCC4; background: #FFFFFF; display: flex; align-items: center; justify-content: center"><svg width="20" height="20" viewBox="0 0 24 24" fill="#4F4036" aria-hidden="true"><circle cx="5" cy="12" r="1.8"></circle><circle cx="12" cy="12" r="1.8"></circle><circle cx="19" cy="12" r="1.8"></circle></svg></button>
        </div>
        <sc-if value="{{hasDishes}}" hint-placeholder-val="{{ true }}">
          <div style="display: flex; flex-wrap: wrap; gap: 6px">
            <sc-for list="{{dishes}}" as="dsh" hint-placeholder-count="3">
              <span style="display: inline-flex; align-items: center; gap: 2px; padding: 0 2px 0 10px; border-radius: 999px; background: #F8ECCB; color: #4F4036; font-size: 13px; font-weight: 600">{{dsh.label}}<button sc-camel-on-click="{{dsh.remove}}" aria-label="{{dsh.aria}}" style="width: 32px; height: 32px; border: none; background: transparent; font: 600 16px 'Plus Jakarta Sans', sans-serif; color: #6B5A4E; cursor: pointer">×</button></span>
            </sc-for>
          </div>
        </sc-if>
        <sc-if value="{{noDishes}}" hint-placeholder-val="{{ false }}">
          <div style="background: #FBF6EC; border-radius: 12px; padding: 10px 12px; font-size: 13px; color: #6B5A4E">No dishes yet</div>
        </sc-if>
        <div style="display: flex; gap: 8px">
          <input aria-label="Add a dish to breakfast" value="{{dishDraft}}" sc-camel-on-change="{{setDishDraft}}" placeholder="Add a dish, e.g. Upma" style="flex: 1; min-width: 0; height: 44px; border-radius: 12px; border: 1px solid #D9C9AC; background: #FFFFFF; padding: 0 12px; font: 500 14px 'Plus Jakarta Sans', sans-serif; color: #2A1A14">
          <button sc-camel-on-click="{{addDish}}" style="height: 44px; padding: 0 14px; border-radius: 12px; border: 1.5px solid #7A1F2B; background: #FFFFFF; font: 700 14px 'Plus Jakarta Sans', sans-serif; color: #7A1F2B; cursor: pointer">+ Add</button>
        </div>
      </div>
    </div>
    <a href="AddMeal.dc.html" style="min-height: 52px; border-radius: 26px; background: #7A1F2B; color: #FFFFFF; font-size: 16px; font-weight: 700; display: flex; align-items: center; justify-content: center; text-decoration: none">+ Add a meal</a>
  </div>
  <!-- bottom tab bar: built already -->
</div>
```


## Screen 5.2 · Add a meal

```html
<div style="width: 390px; height: 1240px; background: #FBF6EC; position: relative; overflow: hidden; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; color: #2A1A14">
  <div aria-hidden="true" style="height: 14px; background: radial-gradient(circle, #C99A2E 1.7px, transparent 2.2px) 0 0 / 14px 14px, #7A1F2B; border-bottom: 2px solid #C99A2E"></div>
  <div style="padding: 12px 20px 24px; height: 1224px; box-sizing: border-box; display: flex; flex-direction: column; gap: 22px">
    <a href="Food.dc.html" style="align-self: flex-start; display: flex; align-items: center; gap: 6px; min-height: 44px; padding: 0 16px 0 10px; border-radius: 22px; background: #FFFFFF; border: 1px solid #E9DCC4; text-decoration: none; color: #2A1A14; font-size: 15px; font-weight: 700"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"></path></svg>Cancel</a>
    <div style="display: flex; flex-direction: column; gap: 4px">
      <h1 style="margin: 0; font-size: 28px">Add a meal</h1>
      <span style="font-size: 14px; color: #6B5A4E">For Mehandi · Thu 22 Apr</span>
    </div>
    <div style="display: flex; flex-direction: column; gap: 10px">
      <span style="font-size: 15px; font-weight: 700">Which meal?</span>
      <div style="display: flex; flex-wrap: wrap; gap: 8px">
        <sc-for list="{{meals}}" as="ml" hint-placeholder-count="4">
          <span style="{{ml.wrapStyle}}">
            <button sc-camel-on-click="{{ml.pick}}" aria-pressed="{{ml.pressed}}" style="{{ml.style}}">{{ml.label}}</button>
            <button sc-camel-on-click="{{ml.remove}}" aria-label="{{ml.removeAria}}" style="{{ml.xStyle}}">×</button>
          </span>
        </sc-for>
      </div>
      <div style="display: flex; gap: 8px">
        <input aria-label="Add your own meal" value="{{mealDraft}}" sc-camel-on-change="{{setMealDraft}}" placeholder="Add your own, e.g. Welcome drinks" style="flex: 1; min-width: 0; height: 48px; border-radius: 12px; border: 1px solid #D9C9AC; background: #FFFFFF; padding: 0 14px; font: 500 15px 'Plus Jakarta Sans', sans-serif; color: #2A1A14">
        <button sc-camel-on-click="{{addMeal}}" style="height: 48px; padding: 0 16px; border-radius: 12px; border: 1.5px solid #7A1F2B; background: #FFFFFF; font: 700 15px 'Plus Jakarta Sans', sans-serif; color: #7A1F2B; cursor: pointer">+ Add</button>
      </div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 8px">
      <div style="display: flex; justify-content: space-between; align-items: baseline">
        <span style="font-size: 15px; font-weight: 700">Time</span>
        <span style="font-size: 15px; font-weight: 700; color: #7A1F2B">{{timeLabel}}</span>
      </div>
      <div style="background: #FFFFFF; border: 1px solid #E9DCC4; border-radius: 16px; padding: 12px; display: flex; flex-direction: column; gap: 12px">
        <div style="display: flex; align-items: center; gap: 10px">
          <span style="font-size: 14px; font-weight: 600; color: #4F4036; width: 56px">Hour</span>
          <div style="flex: 1; display: flex; align-items: center; justify-content: space-between; border-radius: 12px; border: 1px solid #D9C9AC">
            <button aria-label="Earlier hour" sc-camel-on-click="{{hourDown}}" style="width: 48px; height: 48px; border: none; background: transparent; font: 700 22px 'Plus Jakarta Sans', sans-serif; color: #2A1A14; cursor: pointer">−</button>
            <span style="font-size: 20px; font-weight: 800">{{hour}}</span>
            <button aria-label="Later hour" sc-camel-on-click="{{hourUp}}" style="width: 48px; height: 48px; border: none; background: transparent; font: 700 22px 'Plus Jakarta Sans', sans-serif; color: #2A1A14; cursor: pointer">+</button>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 10px">
          <span style="font-size: 14px; font-weight: 600; color: #4F4036; width: 56px">Minute</span>
          <div style="flex: 1; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px">
            <sc-for list="{{mins}}" as="mn" hint-placeholder-count="4">
              <button sc-camel-on-click="{{mn.pick}}" style="{{mn.style}}">{{mn.label}}</button>
            </sc-for>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px">
          <button sc-camel-on-click="{{pickAm}}" style="{{amStyle}}">Morning (AM)</button>
          <button sc-camel-on-click="{{pickPm}}" style="{{pmStyle}}">Afternoon / Evening (PM)</button>
        </div>
      </div>
    </div>
    <label style="display: flex; flex-direction: column; gap: 8px; font-size: 15px; font-weight: 700">Diet notes <span style="font-weight: 500; color: #6B5A4E; font-size: 14px">Optional</span>
      <input placeholder="e.g. pure vegetarian, no onion or garlic" style="height: 52px; border-radius: 12px; border: 1px solid #D9C9AC; background: #FFFFFF; padding: 0 16px; font: 500 16px 'Plus Jakarta Sans', sans-serif; color: #2A1A14">
    </label>
    <div style="display: flex; flex-direction: column; gap: 8px">
      <div style="display: flex; align-items: center; justify-content: space-between">
        <span style="font-size: 15px; font-weight: 700">How many guests?</span>
        <div style="display: flex; align-items: center; gap: 4px; border-radius: 12px; border: 1px solid #D9C9AC; background: #FFFFFF">
          <button aria-label="Fewer guests" sc-camel-on-click="{{guestsDown}}" style="width: 48px; height: 48px; border: none; background: transparent; font: 700 22px 'Plus Jakarta Sans', sans-serif; color: #2A1A14; cursor: pointer">−</button>
          <span style="width: 40px; text-align: center; font-size: 18px; font-weight: 700">{{guests}}</span>
          <button aria-label="More guests" sc-camel-on-click="{{guestsUp}}" style="width: 48px; height: 48px; border: none; background: transparent; font: 700 22px 'Plus Jakarta Sans', sans-serif; color: #2A1A14; cursor: pointer">+</button>
        </div>
      </div>
      <span style="font-size: 13px; color: #6B5A4E">Filled in from the guest list. Change it only if this meal is different.</span>
    </div>
    <a href="Food.dc.html" style="margin-top: auto; min-height: 56px; border-radius: 28px; background: #7A1F2B; color: #FFFFFF; font-size: 17px; font-weight: 700; display: flex; align-items: center; justify-content: center; text-decoration: none">Save meal</a>
  </div>
</div>
```


## Screen 5.3 · To-do

```html
<div style="width: 390px; height: 940px; background: #FBF6EC; position: relative; overflow: hidden; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; color: #2A1A14">
  <div aria-hidden="true" style="height: 14px; background: radial-gradient(circle, #C99A2E 1.7px, transparent 2.2px) 0 0 / 14px 14px, #7A1F2B; border-bottom: 2px solid #C99A2E"></div>
  <div style="padding: 12px 20px 100px; display: flex; flex-direction: column; gap: 18px">
    <a href="Main.dc.html" style="align-self: flex-start; display: flex; align-items: center; gap: 6px; min-height: 44px; padding: 0 16px 0 10px; border-radius: 22px; background: #FFFFFF; border: 1px solid #E9DCC4; text-decoration: none; color: #2A1A14; font-size: 15px; font-weight: 700"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"></path></svg>Home</a>
    <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px">
      <h1 style="margin: 0; font-size: 28px">To-do</h1>
      <a href="AddTask.dc.html" style="min-height: 44px; padding: 0 16px; border-radius: 22px; background: #7A1F2B; color: #FFFFFF; font-size: 15px; font-weight: 700; display: flex; align-items: center; text-decoration: none">+ Add a task</a>
    </div>
    <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; position: relative; z-index: 5">
      <div style="display: flex; flex-direction: column; gap: 6px; position: relative">
        <span style="font-size: 13px; font-weight: 700; color: #4F4036">Show tasks for</span>
        <button sc-camel-on-click="{{toggleWho}}" aria-haspopup="listbox" aria-expanded="{{whoOpenStr}}" style="min-height: 48px; border-radius: 12px; border: 1px solid #D9C9AC; background: #FFFFFF; padding: 0 12px; display: flex; align-items: center; justify-content: space-between; gap: 6px; font: 600 15px 'Plus Jakarta Sans', sans-serif; color: #2A1A14; cursor: pointer; text-align: left">{{whoLabel}}<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 9l6 6 6-6"></path></svg></button>
        <sc-if value="{{whoOpen}}" hint-placeholder-val="{{ false }}">
          <div role="listbox" aria-label="Show tasks for" style="position: absolute; top: 76px; left: 0; width: 220px; max-height: 300px; overflow-y: auto; background: #FFFFFF; border: 1px solid #E9DCC4; border-radius: 14px; box-shadow: 0 8px 24px rgba(42,26,20,0.18); padding: 6px; display: flex; flex-direction: column; gap: 2px">
            <sc-for list="{{whoOpts}}" as="o" hint-placeholder-count="7">
              <button role="option" aria-selected="{{o.sel}}" sc-camel-on-click="{{o.pick}}" style="{{o.style}}">{{o.label}}</button>
            </sc-for>
          </div>
        </sc-if>
      </div>
      <div style="display: flex; flex-direction: column; gap: 6px; position: relative">
        <span style="font-size: 13px; font-weight: 700; color: #4F4036">Show tasks in</span>
        <button sc-camel-on-click="{{toggleEv}}" aria-haspopup="listbox" aria-expanded="{{evOpenStr}}" style="min-height: 48px; border-radius: 12px; border: 1px solid #D9C9AC; background: #FFFFFF; padding: 0 12px; display: flex; align-items: center; justify-content: space-between; gap: 6px; font: 600 15px 'Plus Jakarta Sans', sans-serif; color: #2A1A14; cursor: pointer; text-align: left">{{evLabel}}<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 9l6 6 6-6"></path></svg></button>
        <sc-if value="{{evOpen}}" hint-placeholder-val="{{ false }}">
          <div role="listbox" aria-label="Show tasks in" style="position: absolute; top: 76px; right: 0; width: 220px; background: #FFFFFF; border: 1px solid #E9DCC4; border-radius: 14px; box-shadow: 0 8px 24px rgba(42,26,20,0.18); padding: 6px; display: flex; flex-direction: column; gap: 2px">
            <sc-for list="{{evOpts}}" as="o" hint-placeholder-count="4">
              <button role="option" aria-selected="{{o.sel}}" sc-camel-on-click="{{o.pick}}" style="{{o.style}}">{{o.label}}</button>
            </sc-for>
          </div>
        </sc-if>
      </div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 8px">
      <span style="font-size: 15px; color: #4F4036">{{progressLabel}}</span>
      <div style="height: 8px; background: #F1E7D6; border-radius: 4px; overflow: hidden"><div style="{{barStyle}}"></div></div>
    </div>
    <sc-if value="{{hasOpen}}" hint-placeholder-val="{{ true }}">
      <div style="background: #FFFFFF; border: 1px solid #E9DCC4; border-radius: 16px; display: flex; flex-direction: column">
        <sc-for list="{{openTasks}}" as="t" hint-placeholder-count="3">
          <div style="display: flex; align-items: center; gap: 12px; padding: 12px 12px 12px 16px; min-height: 64px; border-bottom: 1px solid #F1E7D6">
            <button sc-camel-on-click="{{t.toggle}}" aria-label="{{t.doneAria}}" aria-pressed="false" style="width: 28px; height: 28px; border-radius: 8px; border: 2px solid #B9A684; background: #FFFFFF; flex: none; cursor: pointer"></button>
            <span style="flex: 1; display: flex; flex-direction: column; gap: 2px"><span style="font-size: 16px; font-weight: 700">{{t.name}}</span><span style="font-size: 13px; color: #6B5A4E">{{t.meta}}</span></span>
            <span style="{{t.dateStyle}}">{{t.date}}</span>
            <button sc-camel-on-click="{{t.del}}" aria-label="{{t.delAria}}" style="width: 40px; height: 40px; border-radius: 10px; border: 1px solid #E9DCC4; background: #FFFFFF; display: flex; align-items: center; justify-content: center; flex: none; cursor: pointer"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7A1F2B" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"></path><path d="M10 11v6M14 11v6"></path></svg></button>
          </div>
        </sc-for>
      </div>
    </sc-if>
    <sc-if value="{{noOpen}}" hint-placeholder-val="{{ false }}">
      <div style="border: 2px dashed #D9C9AC; border-radius: 16px; padding: 18px; text-align: center; font-size: 15px; color: #6B5A4E">{{emptyLabel}}</div>
    </sc-if>
    <div style="display: flex; flex-direction: column; gap: 8px">
      <button sc-camel-on-click="{{toggleDone}}" aria-expanded="{{doneOpenStr}}" style="min-height: 48px; border-radius: 14px; border: 1px solid #E9DCC4; background: #FFFFFF; text-align: left; padding: 0 16px; display: flex; align-items: center; justify-content: space-between; font: 600 15px 'Plus Jakarta Sans', sans-serif; color: #4F4036; cursor: pointer">Completed ({{doneCount}})<span aria-hidden="true">{{doneChevron}}</span></button>
      <sc-if value="{{doneOpen}}" hint-placeholder-val="{{ false }}">
        <div style="background: #FFFFFF; border: 1px solid #E9DCC4; border-radius: 16px; display: flex; flex-direction: column">
          <sc-for list="{{doneTasks}}" as="d" hint-placeholder-count="1">
            <div style="display: flex; align-items: center; gap: 12px; padding: 12px 16px; min-height: 56px; border-bottom: 1px solid #F1E7D6">
              <button sc-camel-on-click="{{d.toggle}}" aria-label="{{d.doneAria}}" aria-pressed="true" style="width: 28px; height: 28px; border-radius: 8px; border: none; background: #2F5D3A; color: #FFFFFF; font: 800 15px 'Plus Jakarta Sans', sans-serif; flex: none; cursor: pointer">✓</button>
              <span style="flex: 1; font-size: 15px; color: #6B5A4E; text-decoration: line-through">{{d.name}} · {{d.who}}</span>
            </div>
          </sc-for>
        </div>
      </sc-if>
    </div>
  </div>
  <!-- bottom tab bar: built already -->
</div>
```


## Screen 5.4 · Add a task

```html
<div style="width: 390px; height: 1340px; background: #FBF6EC; position: relative; overflow: hidden; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; color: #2A1A14">
  <div aria-hidden="true" style="height: 14px; background: radial-gradient(circle, #C99A2E 1.7px, transparent 2.2px) 0 0 / 14px 14px, #7A1F2B; border-bottom: 2px solid #C99A2E"></div>
  <div style="padding: 12px 20px 24px; height: 1324px; box-sizing: border-box; display: flex; flex-direction: column; gap: 22px">
    <a href="Tasks.dc.html" style="align-self: flex-start; display: flex; align-items: center; gap: 6px; min-height: 44px; padding: 0 16px 0 10px; border-radius: 22px; background: #FFFFFF; border: 1px solid #E9DCC4; text-decoration: none; color: #2A1A14; font-size: 15px; font-weight: 700"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"></path></svg>Cancel</a>
    <h1 style="margin: 0; font-size: 28px">Add a task</h1>
    <label style="display: flex; flex-direction: column; gap: 8px; font-size: 15px; font-weight: 700">Task
      <input placeholder="e.g. Book train tickets" style="height: 52px; border-radius: 12px; border: 1px solid #D9C9AC; background: #FFFFFF; padding: 0 16px; font: 500 16px 'Plus Jakarta Sans', sans-serif; color: #2A1A14">
    </label>
    <div style="display: flex; flex-direction: column; gap: 10px">
      <span style="display: flex; justify-content: space-between; align-items: baseline"><span style="font-size: 15px; font-weight: 700">Who does it?</span><span style="font-size: 13px; color: #6B5A4E">{{countLabel}}</span></span>
      <div style="display: flex; flex-wrap: wrap; gap: 8px">
        <sc-for list="{{people}}" as="p" hint-placeholder-count="6">
          <span style="{{p.wrapStyle}}">
            <button sc-camel-on-click="{{p.pick}}" aria-pressed="{{p.pressed}}" style="{{p.style}}">{{p.label}}</button>
            <button sc-camel-on-click="{{p.remove}}" aria-label="{{p.removeAria}}" style="{{p.xStyle}}">×</button>
          </span>
        </sc-for>
      </div>
      <div style="display: flex; gap: 8px">
        <input aria-label="Add a new name" value="{{draft}}" sc-camel-on-change="{{setDraft}}" placeholder="Add a new name" style="flex: 1; min-width: 0; height: 48px; border-radius: 12px; border: 1px solid #D9C9AC; background: #FFFFFF; padding: 0 14px; font: 500 15px 'Plus Jakarta Sans', sans-serif; color: #2A1A14">
        <button sc-camel-on-click="{{addName}}" style="height: 48px; padding: 0 16px; border-radius: 12px; border: 1.5px solid #7A1F2B; background: #FFFFFF; font: 700 15px 'Plus Jakarta Sans', sans-serif; color: #7A1F2B; cursor: pointer">+ Add</button>
      </div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 8px">
      <span style="font-size: 15px; font-weight: 700">Belongs to</span>
      <div style="display: flex; flex-wrap: wrap; gap: 8px">
        <sc-for list="{{events}}" as="e" hint-placeholder-count="3">
          <button sc-camel-on-click="{{e.pick}}" aria-pressed="{{e.pressed}}" style="{{e.style}}">{{e.label}}</button>
        </sc-for>
      </div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 10px">
      <button sc-camel-on-click="{{toggleDeadline}}" role="switch" aria-checked="{{deadlineStr}}" style="min-height: 56px; border-radius: 14px; border: 1px solid #E9DCC4; background: #FFFFFF; padding: 0 16px; display: flex; align-items: center; justify-content: space-between; font: 700 15px 'Plus Jakarta Sans', sans-serif; color: #2A1A14; cursor: pointer; text-align: left">
        <span style="display: flex; flex-direction: column; gap: 2px"><span>Set a deadline</span><span style="font-size: 13px; font-weight: 500; color: #6B5A4E">{{deadlineHint}}</span></span>
        <span style="{{trackStyle}}"><span style="{{knobStyle}}"></span></span>
      </button>
      <sc-if value="{{deadline}}" hint-placeholder-val="{{ false }}">
        <div style="background: #FFFFFF; border: 1px solid #E9DCC4; border-radius: 16px; padding: 12px; display: flex; flex-direction: column; gap: 8px">
          <div style="display: flex; align-items: center; justify-content: space-between">
            <button aria-label="Previous month" sc-camel-on-click="{{prevMonth}}" style="width: 44px; height: 44px; border-radius: 22px; border: none; background: #FBF6EC; display: flex; align-items: center; justify-content: center; cursor: pointer"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2A1A14" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"></path></svg></button>
            <span style="font-size: 16px; font-weight: 700">{{monthLabel}}</span>
            <button aria-label="Next month" sc-camel-on-click="{{nextMonth}}" style="width: 44px; height: 44px; border-radius: 22px; border: none; background: #FBF6EC; display: flex; align-items: center; justify-content: center; cursor: pointer"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2A1A14" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M9 5l7 7-7 7"></path></svg></button>
          </div>
          <div style="display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 4px; text-align: center; font-size: 12px; font-weight: 700; color: #6B5A4E">
            <span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span><span>Su</span>
          </div>
          <div style="display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 4px">
            <sc-for list="{{cells}}" as="c" hint-placeholder-count="35">
              <button sc-camel-on-click="{{c.pick}}" disabled="{{c.blank}}" aria-label="{{c.aria}}" style="{{c.style}}">{{c.label}}</button>
            </sc-for>
          </div>
        </div>
      </sc-if>
    </div>
    <a href="Tasks.dc.html" style="margin-top: auto; min-height: 56px; border-radius: 28px; background: #7A1F2B; color: #FFFFFF; font-size: 17px; font-weight: 700; display: flex; align-items: center; justify-content: center; text-decoration: none">Add task</a>
  </div>
</div>
```
