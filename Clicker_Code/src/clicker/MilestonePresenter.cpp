#include "clicker/MilestonePresenter.h"
#include "screens/OledScreen.h"
#include "screens/ScreenDrawer.h"

bool MilestonePresenter::stepElapsed(uint32_t nowMs, uint32_t durationMs) const {
    return (nowMs - stepStartMs) >= durationMs;
}

void MilestonePresenter::start(const MilestoneEventInfo& eventInfo) {
    if (findCelebrationScreen(eventInfo.lifetimeClicks) == nullptr) {
        return;
    }

    active = true;
    info = eventInfo;
    stepStartMs = millis();
}

void MilestonePresenter::cancel() {
    active = false;
}

void MilestonePresenter::update(uint32_t nowMs) {
    if (!active) {
        return;
    }

    if (stepElapsed(nowMs, SCREEN_HOLD_MS)) {
        cancel();
    }
}

void MilestonePresenter::draw(uint32_t nowMs) {
    if (!active) {
        return;
    }

    const CelebrationScreen* screen = findCelebrationScreen(info.lifetimeClicks);
    if (screen == nullptr) {
        return;
    }

    ScreenDrawer::drawCelebration(screen, info.lifetimeClicks, nowMs, 0);
}
