document.addEventListener('DOMContentLoaded', () => {
    // 1. 네비게이션바 스크롤 효과
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 2. 부드러운 스크롤 이동 (Smooth Scrolling)
    document.querySelectorAll('.nav-links a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId.startsWith('#')) {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // 3. 스크롤 진입 시 페이드 인/업 애니메이션 (Intersection Observer)
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const animateObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                // 한번 실행된 요소는 관찰 해제
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // 프로그램 카드들에 초기 스타일 적용 후 관찰 시작
    document.querySelectorAll('.program-card').forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(40px)';
        el.style.transition = `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s`;
        animateObserver.observe(el);
    });

    // 4. 탭 전환 로직 (Tabs Switching)
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab-id');
            
            // 버튼 활성화 상태 변경
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // 탭 패널 활성화 상태 변경
            tabPanes.forEach(pane => pane.classList.remove('active'));
            const targetPane = document.getElementById(`${tabId}-tab`);
            if (targetPane) {
                targetPane.classList.add('active');
                
                // 탭 전환을 알리는 커스텀 이벤트 발생 (다른 컴포넌트의 리사이즈 등 보정용)
                window.dispatchEvent(new CustomEvent('tabChanged', { detail: { tabId } }));
            }
        });
    });
});
