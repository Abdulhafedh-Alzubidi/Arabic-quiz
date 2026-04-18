 const tsOne = ["alif maqsoora", "alif maqsura", "alif maqsoorah", "alif maqsourah", "alif maqsoura"];
        const tsTwo = ["alif", "alef", "ا", "أ"];
        const tsThree = ["sukoon", "sokoon", "سُكُون", "sukoun", "سكون"];
        const tsFour = ["damma", "dumma", "ضمة", "dammah"];
        const tsFive = ["tanween", "tanween al-dhammah", "تنوين الضم"];
        const tsSix = ["kitabun", "كتابُُ", "كتابً", "كتابٍ"];

        // Track T/F selections
        const tfSelections = {};
        function selectTF(btn, qid) {
            const wrap = btn.closest('.tf-wrap');
            wrap.querySelectorAll('.tf-btn').forEach(b => b.className = 'tf-btn');
            const val = btn.dataset.val;
            btn.classList.add(val === 'true' ? 'active-true' : 'active-false');
            tfSelections[qid] = val;
            updateProgress();
        }

        // Track MCQ
        document.querySelectorAll('.mcq-opt input').forEach(radio => {
            radio.addEventListener('change', () => {
                radio.closest('.mcq-options').querySelectorAll('.mcq-opt').forEach(o => o.classList.remove('selected'));
                radio.closest('.mcq-opt').classList.add('selected');
                updateProgress();
            });
        });

        // Track text inputs
        document.querySelectorAll('.ans-text').forEach(inp => {
            inp.addEventListener('input', updateProgress);
        });

        function getAnswered() {
            let count = 0;
            document.querySelectorAll('.q-block').forEach(q => {
                const qid = q.dataset.qid;
                const type = q.dataset.type;
                if (type === 'mcq') {
                    if (q.querySelector('input[type="radio"]:checked')) count++;
                } else if (type === 'tf') {
                    if (tfSelections[qid] !== undefined) count++;
                } else {
                    const inp = q.querySelector('.ans-text');
                    if (inp && inp.value.trim()) count++;
                }
            });
            return count;
        }

        function updateProgress() {
            const answered = getAnswered();
            const total = 36;
            document.getElementById('progress-label').textContent = `${answered} / ${total} answered`;
            document.getElementById('progress-fill').style.width = `${(answered / total) * 100}%`;
        }

        function normalise(str) {
            return str.toLowerCase()
                .replace(/[\u064B-\u065F]/g, '') // strip Arabic diacritics for comparison
                .replace(/\s+/g, ' ')
                .trim();
        }

        function checkAnswer(userAns, correctAns) {
            if (correctAns === 'ts-1') {
                return tsOne.some(ans => normalise(userAns) === ans);
            }
            else if (correctAns === 'ts-2') {
                return tsTwo.some(ans => normalise(userAns) === ans);
            }
            else if (correctAns === 'ts-3') {
                return tsThree.some(ans => normalise(userAns) === ans);
            }
            else if (correctAns === 'ts-4') {
                return tsFour.some(ans => normalise(userAns) === ans);
            }
            else if (correctAns === 'ts-5') {
                return tsFive.some(ans => normalise(userAns) === ans);
            }
            else if (correctAns === 'ts-6') {
                // If the user writes the answer in English, then we can use the normalise function to compare the answers, but if the user writes the answer in Arabic, we should compare the answers without normalising them because normalising will remove the diacritics which are important for the correct answer   
               if (/[^\x00-\x7F]/.test(userAns)) {
                    return tsSix.some(ans => userAns === ans);
                }
                return tsSix.some(ans => normalise(userAns) === ans);
            }
            const u = normalise(userAns);
            const c = normalise(correctAns);
            if (u === c) return true;
            // Partial match for multi-word answers (like tanween sounds)
            const cWords = c.split(/[\s,\/+]+/).filter(Boolean);
            const uWords = u.split(/[\s,\/+]+/).filter(Boolean);
            if (cWords.length > 1) {
                return cWords.every(w => uWords.some(uw => uw.includes(w) || w.includes(uw)));
            }
            return u.includes(c) || c.includes(u);
        }

        function submitQuiz() {
            let total = 0;
            const sectionScores = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
            const sectionTotals = { 1: 6, 2: 6, 3: 6, 4: 6, 5: 6, 6: 6 };

            document.querySelectorAll('.q-block').forEach(q => {
                const qid = q.dataset.qid;
                const type = q.dataset.type;
                const correct = q.dataset.answer;
                const sec = parseInt(qid.split('-')[0]);
                const revEl = document.getElementById('rev-' + qid);

                let userAns = '';
                let isCorrect = false;

                if (type === 'mcq') {
                    const checked = q.querySelector('input[type="radio"]:checked');
                    userAns = checked ? checked.value : '';
                    isCorrect = userAns === correct;
                } else if (type === 'tf') {
                    userAns = tfSelections[qid] || '';
                    isCorrect = userAns === correct;
                } else {
                    const inp = q.querySelector('.ans-text');
                    userAns = inp ? inp.value : '';
                    isCorrect = checkAnswer(userAns, correct);
                }

                // ADD THIS FIX HERE:
                if (userAns.trim() === '') {
                    isCorrect = false; // Cannot be correct if empty
                } else {
                    isCorrect = checkAnswer(userAns, correct);
                }

                q.classList.remove('correct', 'wrong');
                if (userAns) {
                    q.classList.add(isCorrect ? 'correct' : 'wrong');
                }

                if (isCorrect) {
                    total++;
                    sectionScores[sec]++;
                }

                if (revEl) {
                    revEl.classList.add('show');
                    if (isCorrect) {
                        revEl.className = 'answer-reveal show correct-ans';
                        revEl.textContent = '✅ Correct!';
                    } else {
                        revEl.className = 'answer-reveal show wrong-ans';
                        if (correct === "ts-1") {
                            revEl.textContent = `❌ Correct answer: ${tsOne[0]} `;
                        } else if (correct === "ts-2") {
                            revEl.textContent = `❌ Correct answer: ${tsTwo[0]} `;
                        } else if (correct === "ts-3") {
                            revEl.textContent = `❌ Correct answer: ${tsThree[0]} `;
                        } else if (correct === "ts-4") {
                            revEl.textContent = `❌ Correct answer: ${tsFour[0]} `;
                        } else if (correct === "ts-5") {
                            revEl.textContent = `❌ Correct answer: ${tsFive[0]} `;
                        } else if (correct === "ts-6") {
                            revEl.textContent = `❌ Correct answer: ${tsSix[0]} `;
                        } else {
                            revEl.textContent = `❌ Correct answer: ${correct}`;
                        }
                    }
                }
            });

            // Show results
            const pct = Math.round((total / 36) * 100);
            document.getElementById('score-display').textContent = `${total}/36`;

            let msgAr, msgEn;
            if (pct >= 90) { msgAr = 'ما شاء الله! ممتازة! 🌟'; msgEn = "Mashallah! Outstanding performance!"; }
            else if (pct >= 75) { msgAr = 'أحسنتِ! جيد جداً 👏'; msgEn = "Well done! Very good work!"; }
            else if (pct >= 60) { msgAr = 'جيد! استمري في التعلم 💪'; msgEn = "Good effort! Keep practicing!"; }
            else { msgAr = 'لا تيأسي! المراجعة مفيدة 📖'; msgEn = "Don't give up! Review and try again!"; }

            document.getElementById('results-msg-ar').textContent = msgAr;
            document.getElementById('results-msg-en').textContent = msgEn;

            const secNames = ['الهمزة', 'الحركات', 'التنوين', 'التركيب', 'الياء', 'النطق'];
            const scGrid = document.getElementById('section-scores');
            scGrid.innerHTML = '';
            for (let i = 1; i <= 6; i++) {
                scGrid.innerHTML += `<div class="sec-score-pill"><span>${sectionScores[i]}/${sectionTotals[i]}</span>${secNames[i - 1]}</div>`;
            }

            const res = document.getElementById('results');
            res.classList.add('show');
            res.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        function resetQuiz() {
            document.querySelectorAll('.q-block').forEach(q => {
                q.classList.remove('correct', 'wrong');
            });
            document.querySelectorAll('.ans-text').forEach(inp => inp.value = '');
            document.querySelectorAll('input[type="radio"]').forEach(r => r.checked = false);
            document.querySelectorAll('.mcq-opt').forEach(o => o.classList.remove('selected'));
            document.querySelectorAll('.tf-btn').forEach(b => b.className = 'tf-btn');
            document.querySelectorAll('.answer-reveal').forEach(r => { r.classList.remove('show'); r.textContent = ''; });
            Object.keys(tfSelections).forEach(k => delete tfSelections[k]);
            document.getElementById('results').classList.remove('show');
            updateProgress();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        updateProgress();