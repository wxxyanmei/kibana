/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { copyAll } from '../lib';
import { getNodeDownloadInfo } from './nodejs';

export const CreateArchivesSourcesTask = {
  description: 'Creating platform-specific archive source directories',
  async run(config, log, build) {
    await Promise.all(config.getTargetPlatforms().map(async platform => {
      // copy all files from generic build source directory into platform-specific build directory
      await copyAll(
        build.resolvePath('.'),
        build.resolvePathForPlatform(platform, '.'),
        {
          select: [
            '**/*',
            '!node_modules/**',
          ],
          dot: true,
        },
      );

      const currentTime = new Date();
      await copyAll(
        build.resolvePath('node_modules'),
        build.resolvePathForPlatform(platform, 'node_modules'),
        {
          dot: true,
          time: currentTime
        },
      );
      log.debug('Generic build source copied into', platform.getName(), 'specific build directory');

      // copy node.js install
      await copyAll(
        getNodeDownloadInfo(config, platform).extractDir,
        build.resolvePathForPlatform(platform, 'node')
      );
      log.debug('Node.js copied into', platform.getName(), 'specific build directory');
    }));
  }
};