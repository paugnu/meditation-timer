Pod::Spec.new do |s|
  s.name = 'MeditationAudio'
  s.version = '1.0.0'
  s.summary = 'Native ambience fades and meditation deadlines'
  s.description = s.summary
  s.license = { :type => 'MIT' }
  s.author = 'YogaBond'
  s.homepage = 'https://github.com/paugnu/meditation-timer'
  s.platforms = { :ios => '16.4' }
  s.swift_version = '5.9'
  s.source = { :path => '.' }
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.frameworks = 'AVFoundation'
  s.source_files = '**/*.swift'
end
