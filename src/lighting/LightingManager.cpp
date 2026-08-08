#include "lighting/LightingManager.h"

#include "lighting/SceneRepository.h"

namespace smartcabinet {

LightingManager::LightingManager(PwmCabinetLight& pwmCabinet,
                                 AddressableCabinetLight& rgbwCabinet,
                                 MiniatureLights& miniatures)
    : pwmCabinet_(pwmCabinet), rgbwCabinet_(rgbwCabinet), miniatures_(miniatures) {}

void LightingManager::begin() {
    pwmCabinet_.begin();
    rgbwCabinet_.begin();
    miniatures_.begin();
}

void LightingManager::update(uint32_t nowMs) {
    rgbwCabinet_.update(nowMs);
    miniatures_.update(nowMs);
}

void LightingManager::applyScene(SceneId id) {
    const SceneDefinition& scene = SceneRepository::get(id);

    if (scene.pwmCabinet.apply) {
        pwmCabinet_.setBrightness(scene.pwmCabinet.brightness);
        pwmCabinet_.setPower(scene.pwmCabinet.power);
    }

    if (scene.rgbwCabinet.apply) {
        rgbwCabinet_.setBrightness(scene.rgbwCabinet.brightness);
        rgbwCabinet_.setColor(scene.rgbwCabinet.color);
        rgbwCabinet_.setEffect(scene.rgbwCabinet.effect);
        rgbwCabinet_.setPower(scene.rgbwCabinet.power);
    }

    if (scene.miniatures.apply) {
        miniatures_.setBrightness(scene.miniatures.brightness);
        miniatures_.setColor(scene.miniatures.color);
        miniatures_.setEffect(scene.miniatures.effect);
        miniatures_.setPower(scene.miniatures.power);
    }

    activeScene_ = id;
}

SceneId LightingManager::activeScene() const {
    return activeScene_;
}

void LightingManager::setPwmCabinetPower(bool on) {
    pwmCabinet_.setPower(on);
    markManual();
}

void LightingManager::togglePwmCabinet() {
    pwmCabinet_.toggle();
    markManual();
}

void LightingManager::setPwmCabinetBrightness(uint8_t percent) {
    pwmCabinet_.setBrightness(percent);
    markManual();
}

void LightingManager::setRgbwCabinetPower(bool on) {
    rgbwCabinet_.setPower(on);
    markManual();
}

void LightingManager::toggleRgbwCabinet() {
    rgbwCabinet_.toggle();
    markManual();
}

void LightingManager::setRgbwCabinetBrightness(uint8_t percent) {
    rgbwCabinet_.setBrightness(percent);
    markManual();
}

void LightingManager::setRgbwCabinetColor(RgbwColor color) {
    rgbwCabinet_.setColor(color);
    markManual();
}

void LightingManager::setRgbwCabinetEffect(LightEffect effect) {
    rgbwCabinet_.setEffect(effect);
    markManual();
}

void LightingManager::setMiniaturePower(bool on) {
    miniatures_.setPower(on);
    markManual();
}

void LightingManager::toggleMiniatures() {
    miniatures_.toggle();
    markManual();
}

void LightingManager::setMiniatureBrightness(uint8_t percent) {
    miniatures_.setBrightness(percent);
    markManual();
}

void LightingManager::setMiniatureColor(RgbColor color) {
    miniatures_.setColor(color);
    markManual();
}

void LightingManager::setMiniatureEffect(LightEffect effect) {
    miniatures_.setEffect(effect);
    markManual();
}

bool LightingManager::highlightMiniatureSegment(uint16_t ledStart, uint16_t ledCount, RgbColor color) {
    return miniatures_.highlightSegment(ledStart, ledCount, color);
}

void LightingManager::clearMiniatureHighlight() {
    miniatures_.clearHighlight();
}

const PwmCabinetLight& LightingManager::pwmCabinet() const {
    return pwmCabinet_;
}

const AddressableCabinetLight& LightingManager::rgbwCabinet() const {
    return rgbwCabinet_;
}

const MiniatureLights& LightingManager::miniatures() const {
    return miniatures_;
}

void LightingManager::markManual() {
    activeScene_ = SceneId::Manual;
}

}  // namespace smartcabinet
