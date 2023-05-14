using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class SceneController : MonoBehaviour
{
    [SerializeField] GameObject _brainCardsGO;
    [SerializeField] GameObject _earthGO;

    [SerializeField] Camera _mainCamera;

    public void ChangeScene(int earth)
    {
        _earthGO.SetActive(earth == 1);
        _brainCardsGO.SetActive(earth != 1);

        Vector3 pos = _mainCamera.transform.localPosition;

        pos.x = earth == 1 ? 60f : 0f;

        _mainCamera.transform.localPosition = pos;
    }
}
