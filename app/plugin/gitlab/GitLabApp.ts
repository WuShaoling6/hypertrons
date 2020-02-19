// Copyright 2019 Xlab;
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { HostingBase } from '../../basic/HostingPlatform/HostingBase';
import { GitLabConfig } from './GitLabConfig';
import { GitLabClient } from './GitLabClient';
import { Gitlab } from 'gitlab';

export class GitLabApp extends HostingBase<GitLabConfig, GitLabClient, Gitlab> {

  public getInstalledRepos(): Promise<Array<{ repoId: number; ownerId: number; fullName: string; payload: any; }>> {
    return undefined as any;
  }

  public addRepo(_repoId: number, _ownerId: number, _fullName: string, _payload: any): Promise<void> {
    return undefined as any;
  }

  protected initWebhook(_config: GitLabConfig): Promise<void> {
    return undefined as any;
  }

}
