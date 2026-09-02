/**
 * DictaLearn - 30-Day Communication Mastery Plan & Daily Goal Tracker
 * Provides structured daily milestones from basic greetings to fluent workplace communication.
 * Tracks daily missions, streaks, and spaced review schedules.
 */

class StudyPlanManager {
  constructor(app) {
    this.app = app;
    this.storageKey = 'dictalearn_study_plan_v2';
    this.progressFileHandle = null;
    this.restoreProgressFileHandle();
    
    this.roadmap = [
      // Tuần 1: Nền tảng Chào hỏi & Đời sống thường ngày
      { day: 1, week: 1, title: "Chào hỏi & Giới thiệu bản thân", category: "Chào hỏi & Đời sống", level: "A1", desc: "Làm quen câu chào hỏi, hỏi thăm sức khỏe và tự giới thiệu tên, quê quán.", targetWords: 20, targetPhrases: 5, targetSentences: 5 },
      { day: 2, week: 1, title: "Gia đình & Bạn bè", category: "Gia đình & Bạn bè", level: "A1", desc: "Mô tả các thành viên trong gia đình, các mối quan hệ bạn bè thân thiết.", targetWords: 20, targetPhrases: 5, targetSentences: 5 },
      { day: 3, week: 1, title: "Thời gian & Thói quen hàng ngày", category: "Thời gian & Lịch trình", level: "A1", desc: "Nói về giờ giấc, các ngày trong tuần và thói quen sinh hoạt mỗi sáng/tối.", targetWords: 20, targetPhrases: 5, targetSentences: 5 },
      { day: 4, week: 1, title: "Ẩm thực & Thức uống thường nhật", category: "Ẩm thực & Mua sắm", level: "A1", desc: "Gọi món ăn, đặt nước uống tại quán cà phê và bày tỏ sở thích ăn uống.", targetWords: 20, targetPhrases: 5, targetSentences: 5 },
      { day: 5, week: 1, title: "Nhà cửa & Đồ dùng sinh hoạt", category: "Nhà cửa & Đời sống", level: "A1", desc: "Tên gọi đồ vật trong nhà, mô tả vị trí phòng ốc và các việc nhà đơn giản.", targetWords: 20, targetPhrases: 5, targetSentences: 5 },
      { day: 6, week: 1, title: "Hỏi đường & Di chuyển trong thành phố", category: "Du lịch & Giao thông", level: "A2", desc: "Hỏi đường đi, bắt xe buýt, đi tàu điện ngầm và chỉ hướng trái/phải.", targetWords: 20, targetPhrases: 5, targetSentences: 5 },
      { day: 7, week: 1, title: "Tổng kết & Ôn tập Tuần 1 (Kiểm tra)", category: "Chào hỏi & Đời sống", level: "A1", desc: "Ôn tập lại toàn bộ từ vựng và câu đàm thoại tuần 1 qua chế độ Luyện nói.", targetWords: 25, targetPhrases: 8, targetSentences: 8 },

      // Tuần 2: Tiếng Anh Đi làm & Môi trường Công sở
      { day: 8, week: 2, title: "Ngày đầu đi làm & Chào đồng nghiệp", category: "Công việc & Sự nghiệp", level: "A2", desc: "Giới thiệu vị trí công việc, làm quen phòng ban và môi trường văn phòng.", targetWords: 20, targetPhrases: 5, targetSentences: 5 },
      { day: 9, week: 2, title: "Viết Email & Trao đổi công việc", category: "Công việc & Sự nghiệp", level: "A2", desc: "Các cụm từ chuẩn để viết email xin phép, báo cáo tiến độ và gửi tài liệu đính kèm.", targetWords: 20, targetPhrases: 5, targetSentences: 5 },
      { day: 10, week: 2, title: "Lên lịch hẹn & Quản lý thời gian", category: "Công việc & Sự nghiệp", level: "A2", desc: "Đặt lịch họp, đổi giờ hẹn, xin nghỉ phép (annual/sick leave) và thông báo hoãn họp.", targetWords: 20, targetPhrases: 5, targetSentences: 5 },
      { day: 11, week: 2, title: "Họp nhóm & Đóng góp ý kiến (Brainstorming)", category: "Công việc & Sự nghiệp", level: "B1", desc: "Cách nêu quan điểm cá nhân, đồng ý/phản biện lịch sự trong cuộc họp.", targetWords: 20, targetPhrases: 5, targetSentences: 5 },
      { day: 12, week: 2, title: "Thuyết trình & Báo cáo kết quả", category: "Kinh doanh & Tài chính", level: "B1", desc: "Cấu trúc mở đầu bài thuyết trình, giải thích biểu đồ và tóm tắt số liệu kinh doanh.", targetWords: 20, targetPhrases: 5, targetSentences: 5 },
      { day: 13, week: 2, title: "Xử lý sự cố kỹ thuật & Hỗ trợ IT", category: "Công nghệ & Đổi mới", level: "B1", desc: "Mô tả lỗi phần mềm, đường truyền mạng, máy móc văn phòng và yêu cầu hỗ trợ.", targetWords: 20, targetPhrases: 5, targetSentences: 5 },
      { day: 14, week: 2, title: "Tổng kết & Ôn tập Tuần 2 (Tiếng Anh Công sở)", category: "Công việc & Sự nghiệp", level: "B1", desc: "Luyện phát âm các mẫu câu giao tiếp và viết email công sở thông dụng.", targetWords: 25, targetPhrases: 8, targetSentences: 8 },

      // Tuần 3: Mua sắm, Du lịch, Khách sạn & Dịch vụ
      { day: 15, week: 3, title: "Mua sắm & Trả giá (Shopping)", category: "Ẩm thực & Mua sắm", level: "A2", desc: "Hỏi giá, kích cỡ quần áo, thử đồ, hỏi chương trình khuyến mãi và thanh toán thẻ.", targetWords: 20, targetPhrases: 5, targetSentences: 5 },
      { day: 16, week: 3, title: "Đặt bàn & Trải nghiệm nhà hàng (Dining Out)", category: "Ẩm thực & Mua sắm", level: "A2", desc: "Đặt bàn trước, gọi món đặc sản, yêu cầu hóa đơn và tách tiền thanh toán (split bill).", targetWords: 20, targetPhrases: 5, targetSentences: 5 },
      { day: 17, week: 3, title: "Tại sân bay & Thủ tục bay (Airport & Flight)", category: "Du lịch & Giao thông", level: "B1", desc: "Check-in hành lý, qua cổng an ninh, lên máy bay và xử lý thất lạc đồ đạc.", targetWords: 20, targetPhrases: 5, targetSentences: 5 },
      { day: 18, week: 3, title: "Khách sạn & Dịch vụ lưu trú (Hotel Check-in)", category: "Du lịch & Giao thông", level: "B1", desc: "Nhận/trả phòng khách sạn, yêu cầu dịch vụ phòng và phản ánh chất lượng phòng.", targetWords: 20, targetPhrases: 5, targetSentences: 5 },
      { day: 19, week: 3, title: "Sức khỏe, Khám bệnh & Nhà thuốc", category: "Sức khỏe & Thể thao", level: "B1", desc: "Mô tả triệu chứng ốm, mua thuốc theo đơn và lời khuyên chăm sóc sức khỏe.", targetWords: 20, targetPhrases: 5, targetSentences: 5 },
      { day: 20, week: 3, title: "Giải trí, Phim ảnh & Sở thích cá nhân", category: "Nghệ thuật & Giải trí", level: "B1", desc: "Thảo luận về bộ phim yêu thích, thể loại âm nhạc, thể thao và các hoạt động cuối tuần.", targetWords: 20, targetPhrases: 5, targetSentences: 5 },
      { day: 21, week: 3, title: "Tổng kết & Ôn tập Tuần 3 (Du lịch & Đời sống)", category: "Du lịch & Giao thông", level: "B1", desc: "Luyện nghe nói các tình huống du lịch, nhà hàng, khách sạn thực tế.", targetWords: 25, targetPhrases: 8, targetSentences: 8 },

      // Tuần 4: Đàm phán, Phỏng vấn xin việc & Giao tiếp Nâng cao
      { day: 22, week: 4, title: "Phỏng vấn xin việc (Job Interview: Giới thiệu)", category: "Công việc & Sự nghiệp", level: "B2", desc: "Trả lời các câu hỏi phỏng vấn kinh điển về điểm mạnh, điểm yếu và mục tiêu sự nghiệp.", targetWords: 20, targetPhrases: 5, targetSentences: 5 },
      { day: 23, week: 4, title: "Phỏng vấn xin việc: Kinh nghiệm & Tình huống (STAR)", category: "Công việc & Sự nghiệp", level: "B2", desc: "Cách kể câu chuyện thành công, xử lý áp lực và đóng góp giá trị cho công ty.", targetWords: 20, targetPhrases: 5, targetSentences: 5 },
      { day: 24, week: 4, title: "Đàm phán & Thương thảo hợp đồng (Negotiation)", category: "Kinh doanh & Tài chính", level: "B2", desc: "Thương lượng giá cả, điều khoản hợp đồng và hướng đến giải pháp win-win đôi bên cùng có lợi.", targetWords: 20, targetPhrases: 5, targetSentences: 5 },
      { day: 25, week: 4, title: "Giao tiếp xã giao cao cấp (Networking & Small Talk)", category: "Xã hội & Văn hóa", level: "B2", desc: "Nghệ thuật bắt chuyện tại hội thảo quốc tế, kết nối đối tác kinh doanh tự nhiên.", targetWords: 20, targetPhrases: 5, targetSentences: 5 },
      { day: 26, week: 4, title: "Thành ngữ & Tiếng lóng bản xứ thông dụng (Idioms)", category: "Xã hội & Văn hóa", level: "B2", desc: "Sử dụng thành ngữ tiếng Anh tự nhiên trong văn nói để tăng độ trôi chảy như người bản xứ.", targetWords: 20, targetPhrases: 8, targetSentences: 5 },
      { day: 27, week: 4, title: "Thảo luận Học thuật & Xu hướng Công nghệ (AI, Economy)", category: "Học thuật & IELTS", level: "C1", desc: "Bàn luận về xu hướng trí tuệ nhân tạo, tính bền vững môi trường và kinh tế toàn cầu.", targetWords: 20, targetPhrases: 5, targetSentences: 5 },
      { day: 28, week: 4, title: "Giải quyết Xung đột & Phản hồi Khách hàng khó tính", category: "Công việc & Sự nghiệp", level: "B2", desc: "Kỹ năng xoa dịu khách hàng, xử lý khiếu nại và giải quyết mâu thuẫn chuyên nghiệp.", targetWords: 20, targetPhrases: 5, targetSentences: 5 },
      { day: 29, week: 4, title: "Tự tin Nói trước Đám đông & Truyền cảm hứng", category: "Học thuật & IELTS", level: "C1", desc: "Kỹ năng làm chủ sân khấu, dùng từ ngữ hùng biện và tạo ấn tượng mạnh mẽ.", targetWords: 20, targetPhrases: 5, targetSentences: 5 },
      { day: 30, week: 4, title: "Tốt nghiệp Lộ trình 30 Ngày - Tự Tin Giao Tiếp!", category: "Chào hỏi & Đời sống", level: "B2", desc: "Đánh giá toàn diện, kiểm tra phản xạ nghe nói và hoàn thành lộ trình làm chủ tiếng Anh!", targetWords: 30, targetPhrases: 10, targetSentences: 10 }
    ];

    this.state = this.loadState();
  }

  loadState() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          currentDay: parsed.currentDay || 1,
          cycle: parsed.cycle || 1,
          completedSessions: parsed.completedSessions || Object.keys(parsed.completedDays || {}).length,
          completedDays: parsed.completedDays || {},
          dailyHistory: Array.isArray(parsed.dailyHistory) ? parsed.dailyHistory : [],
          speakingScores: Array.isArray(parsed.speakingScores) ? parsed.speakingScores.slice(-200) : [],
          lastCompletedDate: parsed.lastCompletedDate || null,
          todayProgress: parsed.todayProgress || this.createEmptyTodayProgress()
        };
      }
    } catch (e) {}

    return {
      currentDay: 1,
      cycle: 1,
      completedSessions: 0,
      completedDays: {}, // { 1: true, 2: true }
      dailyHistory: [],
      speakingScores: [],
      lastCompletedDate: null,
      todayProgress: this.createEmptyTodayProgress()
    };
  }

  createEmptyTodayProgress() {
    return {
      date: new Date().toDateString(), wordsTyped: 0, phrasesPracticed: 0,
      sentencesPracticed: 0, speakingAttempts: 0
    };
  }

  openFileHandleDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('dictalearn_files', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('handles');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async restoreProgressFileHandle() {
    try {
      const db = await this.openFileHandleDatabase();
      const request = db.transaction('handles', 'readonly').objectStore('handles').get('dailyProgress');
      this.progressFileHandle = await new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
      db.close();
    } catch (e) {
      this.progressFileHandle = null;
    }
  }

  async rememberProgressFileHandle(handle) {
    const db = await this.openFileHandleDatabase();
    const transaction = db.transaction('handles', 'readwrite');
    transaction.objectStore('handles').put(handle, 'dailyProgress');
    await new Promise((resolve, reject) => {
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
    });
    db.close();
  }

  async getWritableProgressFile() {
    if (!window.showSaveFilePicker) {
      this.app.showToast('Trình duyệt này không hỗ trợ ghi trực tiếp vào một file. Hãy mở ứng dụng bằng Microsoft Edge hoặc Chrome.');
      return null;
    }
    try {
      if (this.progressFileHandle) {
        let permission = await this.progressFileHandle.queryPermission({ mode: 'readwrite' });
        if (permission !== 'granted') permission = await this.progressFileHandle.requestPermission({ mode: 'readwrite' });
        if (permission === 'granted') return this.progressFileHandle;
      }
      const handle = await window.showSaveFilePicker({
        suggestedName: 'dictalearn_progress.json',
        types: [{ description: 'DictaLearn progress', accept: { 'application/json': ['.json'] } }]
      });
      this.progressFileHandle = handle;
      await this.rememberProgressFileHandle(handle);
      return handle;
    } catch (e) {
      if (e.name !== 'AbortError') this.app.showToast('Không thể mở file tiến độ để ghi.');
      return null;
    }
  }

  saveState() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (e) {}
  }

  checkDailyReset() {
    const today = new Date().toDateString();
    if (this.state.todayProgress.date !== today) {
      const previousDate = this.state.todayProgress.date;
      if (this.state.lastCompletedDate === previousDate) {
        this.advancePlanDay();
        this.state.todayProgress = this.createEmptyTodayProgress();
      } else {
        // Chưa hoàn thành: giữ nguyên số lượng đã học để hôm sau tiếp tục đúng bài.
        this.state.todayProgress.date = today;
      }
      this.saveState();
    }
  }

  advancePlanDay() {
    if (this.state.currentDay >= this.roadmap.length) {
      this.state.currentDay = 1;
      this.state.cycle = (this.state.cycle || 1) + 1;
      this.state.completedDays = {};
    } else {
      this.state.currentDay++;
    }
  }

  recordTypingAttempt(item, isCorrect) {
    if (!isCorrect) return;
    this.checkDailyReset();

    if (item.type === 'sentence') {
      this.state.todayProgress.sentencesPracticed++;
    } else if (item.type === 'phrase') {
      this.state.todayProgress.phrasesPracticed++;
    } else {
      this.state.todayProgress.wordsTyped++;
    }

    this.saveState();
    this.updateDailyMissionWidget();
  }

  recordSpeakingAttempt(score) {
    this.checkDailyReset();
    this.state.speakingScores.push(Number(score) || 0);
    this.state.speakingScores = this.state.speakingScores.slice(-200);
    if (score >= 60) {
      this.state.todayProgress.speakingAttempts++;
      this.saveState();
      this.updateDailyMissionWidget();
    }
  }

  toggleDayCompleted(dayNum) {
    if (this.state.completedDays[dayNum]) {
      delete this.state.completedDays[dayNum];
    } else {
      this.state.completedDays[dayNum] = true;
      this.app.audio.playCelebrationSound();
    }
    this.saveState();
    this.renderRoadmap();
  }

  startDayStudy(dayNum) {
    const dayObj = this.roadmap.find(d => d.day === dayNum);
    if (!dayObj) return;

    this.state.currentDay = dayNum;
    this.saveState();

    // Switch app to this day's level & category
    this.app.currentLevel = dayObj.level;
    this.app.currentMode = 'all';

    const levelBtn = document.querySelector(`.pill-btn[data-level="${dayObj.level}"]`);
    if (levelBtn) {
      document.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
      levelBtn.classList.add('active');
    }

    this.app.filterAndRenderActiveList();
    this.app.closeModal('studyPlanModal');

    // Show toast
    this.app.showToast(`🚀 Đã mở Ngày ${dayNum}: ${dayObj.title} (Cấp độ ${dayObj.level})`);
  }

  updateDailyMissionWidget() {
    this.checkDailyReset();
    const currentDayObj = this.roadmap.find(d => d.day === this.state.currentDay) || this.roadmap[0];

    const wordsVal = document.getElementById('missionWordsVal');
    const phrasesVal = document.getElementById('missionPhrasesVal');
    const sentencesVal = document.getElementById('missionSentencesVal');
    const speakingVal = document.getElementById('missionSpeakingVal');
    const progressBar = document.getElementById('dailyProgressBar');
    const progressPercent = document.getElementById('dailyProgressPercent');
    const dayTitleEl = document.getElementById('dailyMissionDayTitle');
    const phaseLabel = document.getElementById('dailyPhaseLabel');
    const completeButton = document.getElementById('btnCompleteDay');
    const phase = this.getLearningPhase();
    const targets = this.getAdaptiveTargets(currentDayObj, phase.id);

    if (dayTitleEl) {
      dayTitleEl.textContent = `Chu kỳ ${this.state.cycle} • Ngày ${currentDayObj.day}: ${currentDayObj.title}`;
    }

    if (phaseLabel) phaseLabel.textContent = `${phase.label} • ${phase.detail}`;

    const wordsTarget = targets.words;
    const phrasesTarget = targets.phrases;
    const sentencesTarget = targets.sentences;
    const speakingTarget = targets.speaking;

    const wordsDone = Math.min(wordsTarget, this.state.todayProgress.wordsTyped);
    const phrasesDone = Math.min(phrasesTarget, this.state.todayProgress.phrasesPracticed);
    const sentencesDone = Math.min(sentencesTarget, this.state.todayProgress.sentencesPracticed);
    const speakingDone = Math.min(speakingTarget, this.state.todayProgress.speakingAttempts);

    if (wordsVal) wordsVal.textContent = `${wordsDone}/${wordsTarget}`;
    if (phrasesVal) phrasesVal.textContent = `${phrasesDone}/${phrasesTarget}`;
    if (sentencesVal) sentencesVal.textContent = `${sentencesDone}/${sentencesTarget}`;
    if (speakingVal) speakingVal.textContent = `${speakingDone}/${speakingTarget}`;

    const totalTarget = wordsTarget + phrasesTarget + sentencesTarget + speakingTarget;
    const totalDone = wordsDone + phrasesDone + sentencesDone + speakingDone;
    const percent = Math.min(100, Math.round((totalDone / totalTarget) * 100));

    if (progressBar) progressBar.style.width = `${percent}%`;
    if (progressPercent) progressPercent.textContent = `${percent}%`;

    const completedToday = this.state.lastCompletedDate === this.state.todayProgress.date;
    if (completeButton) {
      completeButton.disabled = false;
      completeButton.textContent = completedToday
        ? '💾 Cập nhật lại file tiến độ hôm nay'
        : percent >= 100
          ? '✅ Hoàn thành ngày & lưu file tiến độ'
          : `💾 Lưu vào file tiến độ (${percent}%)`;
    }
  }

  getLearningPhase() {
    const analytics = this.app.srs.getAnalyticsOverview();
    const scores = this.state.speakingScores || [];
    const speakingAverage = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const sessions = this.state.completedSessions || 0;
    if (sessions >= 60 && analytics.masteredCount >= 1500 && analytics.accuracyRate >= 90 && speakingAverage >= 85) {
      return { id: 'mastery', label: 'Giai đoạn 4: Duy trì thành thạo', detail: `Nói ${speakingAverage}% • Chính xác ${analytics.accuracyRate}%` };
    }
    if (sessions >= 45 || analytics.masteredCount >= 800) return { id: 'fluency', label: 'Giai đoạn 3: Phản xạ giao tiếp', detail: 'Tăng câu và luyện nói' };
    if (sessions >= 30 || analytics.masteredCount >= 300) return { id: 'reinforcement', label: 'Giai đoạn 2: Củng cố', detail: 'Ôn lỗi và dùng câu thực tế' };
    return { id: 'foundation', label: 'Giai đoạn 1: Xây nền', detail: 'Từ, cụm và câu cơ bản' };
  }

  getAdaptiveTargets(day, phaseId) {
    if (phaseId === 'mastery') return { words: 15, phrases: 8, sentences: 8, speaking: 10 };
    if (phaseId === 'fluency') return { words: 30, phrases: 10, sentences: 10, speaking: 10 };
    if (phaseId === 'reinforcement') return { words: 25, phrases: 8, sentences: 8, speaking: 8 };
    return { words: day.targetWords, phrases: day.targetPhrases, sentences: day.targetSentences, speaking: 5 };
  }

  getTodayPercent() {
    const day = this.roadmap.find(d => d.day === this.state.currentDay) || this.roadmap[0];
    const targets = this.getAdaptiveTargets(day, this.getLearningPhase().id);
    const p = this.state.todayProgress;
    const done = Math.min(p.wordsTyped, targets.words) + Math.min(p.phrasesPracticed, targets.phrases) +
      Math.min(p.sentencesPracticed, targets.sentences) + Math.min(p.speakingAttempts, targets.speaking);
    return Math.round((done / (targets.words + targets.phrases + targets.sentences + targets.speaking)) * 100);
  }

  async completeTodayAndDownload() {
    this.checkDailyReset();
    const fileHandle = await this.getWritableProgressFile();
    if (!fileHandle) return false;
    const percent = this.getTodayPercent();
    const isComplete = percent >= 100;
    const alreadyCompletedToday = this.state.lastCompletedDate === this.state.todayProgress.date;
    const analytics = this.app.srs.getAnalyticsOverview();
    if (isComplete && !alreadyCompletedToday) {
      this.state.completedDays[this.state.currentDay] = true;
      this.state.completedSessions = (this.state.completedSessions || 0) + 1;
      this.state.lastCompletedDate = this.state.todayProgress.date;
      this.state.dailyHistory.push({ date: this.app.srs.getLocalDateString(), cycle: this.state.cycle, day: this.state.currentDay, status: 'completed', percent, analytics });
      this.state.dailyHistory = this.state.dailyHistory.slice(-730);
    }
    this.saveState();

    const snapshot = {
      format: 'DictaLearn Daily Progress', version: '1.0.0', exportedAt: new Date().toISOString(),
      localDate: this.app.srs.getLocalDateString(), cycle: this.state.cycle, planDay: this.state.currentDay,
      status: isComplete ? 'completed' : 'in_progress', progressPercent: percent,
      lesson: this.roadmap.find(d => d.day === this.state.currentDay), phase: this.getLearningPhase(),
      todayProgress: { ...this.state.todayProgress }, analytics,
      studyPlan: JSON.parse(JSON.stringify(this.state)),
      srsData: JSON.parse(JSON.stringify(this.app.srs.data))
    };

    try {
      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(snapshot, null, 2));
      await writable.close();
    } catch (e) {
      this.app.showToast('Không thể cập nhật file tiến độ. Vui lòng cấp lại quyền ghi file.');
      return false;
    }
    if (isComplete && !alreadyCompletedToday) this.app.audio.playCelebrationSound();
    this.app.showToast(isComplete
      ? 'Đã hoàn thành ngày học và cập nhật file tiến độ.'
      : `Đã cập nhật ${percent}% vào file tiến độ. Ngày mai bạn tiếp tục đúng bài này.`);
    this.updateDailyMissionWidget();
    return true;
  }

  renderRoadmap() {
    const container = document.getElementById('studyRoadmapList');
    if (!container) return;

    const completedCount = Object.keys(this.state.completedDays).length;
    const overallProgressPercent = Math.round((completedCount / this.roadmap.length) * 100);

    const overallHeader = `
      <div class="roadmap-summary-card">
        <div class="roadmap-summary-header">
          <div>
            <h3 style="margin: 0 0 4px 0; font-size: 1.15rem; color: var(--text-primary);">🎯 Lộ trình thích ứng đến khi giao tiếp thành thạo</h3>
            <p style="margin: 0; font-size: 0.85rem; color: var(--text-secondary);">Chu kỳ ${this.state.cycle} • ${this.getLearningPhase().label} • tiếp tục luyện sau mỗi chu kỳ 30 ngày</p>
          </div>
          <div class="roadmap-badge-completion">${completedCount}/30 ngày • Tổng ${this.state.completedSessions || 0} ngày</div>
        </div>
        <div class="progress-bar-bg" style="margin-top: 12px; height: 8px;">
          <div class="progress-bar-fill" style="width: ${overallProgressPercent}%; background: linear-gradient(90deg, var(--accent-indigo), var(--accent-cyan));"></div>
        </div>
      </div>
    `;

    let weeksHtml = '';
    const weekTitles = {
      1: "Tuần 1: Nền tảng Chào hỏi, Giới thiệu & Đời sống hàng ngày",
      2: "Tuần 2: Tiếng Anh Công sở, Đi làm & Viết Email chuyên nghiệp",
      3: "Tuần 3: Mua sắm, Nhà hàng, Khách sạn & Du lịch quốc tế",
      4: "Tuần 4: Đàm phán, Phỏng vấn xin việc & Làm chủ giao tiếp"
    };

    for (let w = 1; w <= 4; w++) {
      const daysInWeek = this.roadmap.filter(d => d.week === w);
      const weekCompleted = daysInWeek.filter(d => this.state.completedDays[d.day]).length;

      weeksHtml += `
        <div class="roadmap-week-block">
          <div class="roadmap-week-header">
            <h4>${weekTitles[w]}</h4>
            <span class="week-pill-badge">${weekCompleted}/${daysInWeek.length} Ngày</span>
          </div>
          <div class="roadmap-days-grid">
            ${daysInWeek.map(d => {
              const isDone = !!this.state.completedDays[d.day];
              const isCurrent = this.state.currentDay === d.day;
              return `
                <div class="roadmap-day-card ${isDone ? 'completed' : ''} ${isCurrent ? 'current' : ''}">
                  <div class="day-card-header">
                    <span class="day-num-tag">Ngày ${d.day}</span>
                    <span class="day-level-tag level-${d.level.toLowerCase()}">${d.level}</span>
                    <button class="day-check-btn" onclick="window.dictaApp.studyPlan.toggleDayCompleted(${d.day})" title="Đánh dấu hoàn thành">
                      ${isDone ? '✅' : '⚪'}
                    </button>
                  </div>
                  <div class="day-card-body">
                    <h5 class="day-title">${d.title}</h5>
                    <p class="day-desc">${d.desc}</p>
                  </div>
                  <div class="day-card-footer">
                    <span class="day-targets-pill">🎯 ${d.targetWords} từ • ${d.targetPhrases} cụm • ${d.targetSentences} câu</span>
                    <button class="btn-start-day" onclick="window.dictaApp.studyPlan.startDayStudy(${d.day})">
                      ${isCurrent ? '▶ Đang học' : 'Học ngay'}
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    container.innerHTML = overallHeader + weeksHtml;
  }
}

window.StudyPlanManager = StudyPlanManager;
