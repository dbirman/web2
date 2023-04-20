using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class SceneController : MonoBehaviour
{
    [SerializeField] GameObject _brainCardsGO;
    [SerializeField] GameObject _earthGO;

    public void ChangeScene(int earth)
    {
        _earthGO.SetActive(earth == 1);
        _brainCardsGO.SetActive(earth != 1);
    }
}
